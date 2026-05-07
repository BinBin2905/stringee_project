import type { FastifyInstance } from "fastify";
import { env } from "../env.js";
import { eventLog } from "../services/eventLog.js";
import type {
  CalloutAnswerQuery,
  CustomRoutingRequest,
  CustomRoutingResponse,
  CustomerInfo,
  GetCustomerInfoQuery,
  PccEventBody,
  SccoAction,
} from "../types/index.js";

// SCCO returned for callout (agent leg → customer leg). Stringee dials
// the agent first, then GETs this URL to learn how to bridge to the
// customer. We answer with a `connect` to the customer's number.
const buildCalloutScco = (q: CalloutAnswerQuery): SccoAction[] => {
  const customer = q.customerNumber ?? q.to;
  return [
    {
      action: "connect",
      from: { type: "external", number: q.from, alias: q.from },
      to: { type: "external", number: customer, alias: customer },
      peerToPeerCall: false,
    },
  ];
};

export default async function webhookRoutes(fastify: FastifyInstance) {
  // GET customer info — Stringee asks us for context about an inbound
  // call. The JSON we return is forwarded verbatim to the agent via
  // StringeeCall.customDataFromYourServer.
  fastify.get<{ Querystring: GetCustomerInfoQuery; Reply: CustomerInfo }>(
    env.getCustomerInfoUrl,
    async (req, reply) => {
      console.log("get-customer-info:", req.query);
      return reply.send({
        name: req.query.from,
        phone: req.query.from,
        notes: "Lookup not implemented — wire a CRM here.",
      });
    },
  );

  // POST PCC call events — Stringee fires this on every state change
  // (created/started/ringing/answered/ended/agentEnded/connect_failed).
  // We append to the in-memory ring buffer so the admin UI can render a
  // live event feed via /admin/pcc/events/recent.
  fastify.post<{ Body: PccEventBody }>(env.pccEventUrl, async (req, reply) => {
    console.log("pcc-event:", req.body);
    eventLog.push(req.body ?? {});
    return reply.send({ status: "ok" });
  });

  // GET callout answer URL — Stringee invokes this for outbound callout.
  fastify.get<{ Querystring: CalloutAnswerQuery }>(
    env.pccCalloutAnswerUrl,
    async (req, reply) => {
      console.log("pcc-callout-answer:", req.query);

      if (req.query.from.includes("ADAPTIVE")) {
        console.log("Adaptive routing for", req.query.to);
        console.log(pickHotline(req.query.to));
        const scco = [
          {
            action: "connect",
            from: {
              type: "internal",
              number: pickHotline(req.query.to).hotlineNumber,
              alias: pickHotline(req.query.to).hotlineCarrier,
            },
            to: { type: "external", number: req.query.to, alias: req.query.to },
            peerToPeerCall: false,
          },
        ];
        console.log("SCCO:", scco);
        return reply.send(scco);
      }
      // return reply.send(buildCalloutScco(req.query));
    },
  );

  // POST get_list_agents_url — Stringee asks us, per queue, which agents to
  // ring for each pending call. We must reply with `version: 2` and one
  // entry per call. Default policy: forward agents Stringee already named
  // in the request (lets the caller pre-route via Stringee's own logic and
  // only overrides when we have a smarter answer).
  fastify.post<{
    Body: CustomRoutingRequest;
    Reply: CustomRoutingResponse;
  }>(env.getListAgentsUrl, async (req, reply) => {
    const body = req.body ?? { queueId: "", calls: [], projectId: 0 };
    console.log("get-list-agents:", body);
    return reply.send({
      version: 2,
      calls: (body.calls ?? []).map((c) => ({
        callId: c.callId,
        // No agent picker wired yet — return an empty list and let Stringee
        // fall back to the queue's default group routing. Replace this map
        // with your own selection logic (DB lookup / round-robin / skill).
        agents: [
          {
            stringee_user_id: "agent_1",
            phone_number: "842471013029",
            routing_type: 1,
            answer_timeout: 15,
          },
        ],
      })),
    });
  });

  fastify.get("/pcc/get_list_agents_url", async (req, reply) => {
    console.log("get-list-agents (GET):", req.query);
    return reply.send({ status: "ok" });
  });
}

function pickHotline(toPhone: string) {
  const carrier = detectCarrier(toPhone);
  const carrierForHotline = HOTLINE[carrier] ? carrier : FALLBACK_CARRIER;
  return {
    detectedCarrier: carrier,
    hotlineCarrier: carrierForHotline,
    hotlineNumber: HOTLINE[carrierForHotline],
    isOnNetwork: carrier === carrierForHotline && carrier !== "unknown",
  };
}

function detectCarrier(phone: string) {
  const normalized = normalizePhone(phone);
  const prefix = normalized.substring(0, 3);
  for (const [carrier, prefixes] of Object.entries(CARRIER_PREFIX)) {
    if (prefixes.includes(prefix)) return carrier;
  }
  return "unknown";
}

function normalizePhone(phone: string) {
  let n = String(phone || "").replace(/[^0-9]/g, "");
  if (n.startsWith("84")) n = "0" + n.slice(2);
  if (!n.startsWith("0")) n = "0" + n;
  return n;
}

const CARRIER_PREFIX = {
  viettel: [
    "086",
    "096",
    "097",
    "098",
    "032",
    "033",
    "034",
    "035",
    "036",
    "037",
    "038",
    "039",
  ],
  mobifone: ["089", "090", "093", "070", "076", "077", "078", "079"],
  vinaphone: ["088", "091", "094", "081", "082", "083", "084", "085"],
  vietnamobile: ["092", "052", "056", "058"],
  gmobile: ["099", "059"],
};

// Hotline Stringee đã mua cho từng nhà mạng (E.164, không +)
const HOTLINE: { [key: string]: string } = {
  viettel: process.env.HOTLINE_VIETTEL || "84961234567",
  mobifone: process.env.HOTLINE_MOBIFONE || "84901234567",
  vinaphone: process.env.HOTLINE_VINAPHONE || "84911234567",
};

// Fallback khi không nhận diện được carrier
const FALLBACK_CARRIER: string = "viettel";
