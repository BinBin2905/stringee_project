import {
  useCallback,
  useState,
  type FC,
  type KeyboardEvent,
} from "react";
import { getClientToken } from "@/api/auth";
import { pcc } from "@/api/pcc";
import { toast } from "@/lib/toast";
import {
  loadSoftphone,
  type StringeeSoftPhoneFromNumber,
} from "@/lib/stringeeSdk";

// Slice of the documented `/v1/number` list response we actually consume.
interface NumberListResponse {
  r: number;
  message?: string;
  data?: {
    numbers?: { number: string; nickname?: string }[];
  };
}

async function fetchFromNumbers(): Promise<StringeeSoftPhoneFromNumber[]> {
  // Pull all numbers in one shot — PCC accounts rarely exceed a handful.
  const res = await pcc.number.list<NumberListResponse>("page=1&limit=100");
  if (res.status >= 400 || res.data?.r !== 0) {
    throw new Error(
      res.data?.message ?? `Number list failed (status=${res.status})`,
    );
  }
  const numbers = res.data?.data?.numbers ?? [];
  return numbers
    .filter((n) => !!n.number)
    .map((n) => ({ alias: n.nickname?.trim() || n.number, number: n.number }));
}

const SoftphonePage: FC = () => {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const start = useCallback(async () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      toast.warning("Agent user ID required");
      return;
    }
    setLoading(true);
    try {
      const [StringeeSoftPhone, access_token2, fromNumbers] = await Promise.all([
        loadSoftphone(),
        getClientToken(trimmed),
        fetchFromNumbers(),
      ]);

      if (fromNumbers.length === 0) {
        toast.warning("No PCC numbers found — outbound dialing will be empty");
      }

      const config = {
        showMode: "full" as const,
        top: 45,
        left: 50,
        arrowLeft: 155,
        arrowDisplay: "top" as const,
        fromNumbers,
      };
      StringeeSoftPhone.init(config);

      StringeeSoftPhone.on("displayModeChange", function (event) {
        console.log("displayModeChange", event);
        if (event === "min") {
          StringeeSoftPhone.config({ arrowLeft: 75 });
        } else if (event === "full") {
          StringeeSoftPhone.config({ arrowLeft: 155 });
        }
      });

      StringeeSoftPhone.on("requestNewToken", function () {
        console.log("requestNewToken+++++++");
        StringeeSoftPhone.connect(access_token2);
      });

      StringeeSoftPhone.connect(access_token2);
      setConnected(true);
      toast.success(`Softphone connected as ${trimmed}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Connect failed — ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") void start();
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Stringee Agent Softphone</h2>
          <p className="text-xs text-base-content/60">
            Enter an agent user ID to mint an access token and launch the
            Stringee Softphone widget.
          </p>

          <label className="form-control">
            <div className="label py-1">
              <span className="label-text text-xs uppercase tracking-wider">
                User ID
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered input-sm font-mono"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={onKey}
              placeholder="agent_01"
              disabled={loading || connected}
              autoFocus
            />
          </label>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => void start()}
            disabled={loading || connected || !userId.trim()}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : connected ? (
              "Connected"
            ) : (
              "Connect"
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default SoftphonePage;
