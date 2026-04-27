import { env } from "../env.js";
import { StringeeClient } from "./stringeeClient.js";
import { StringeeResource } from "./stringeeResource.js";

// Two clients, one per Stringee host. Same auth.
export const pccClient = new StringeeClient(env.stringeePccApiBase);
export const callClient = new StringeeClient(env.stringeeApiBase);

// PCC / ICC resources. Add a new line here to expose another resource.
export const pcc = {
  agent: new StringeeResource(pccClient, "/v1/agent"),
  queue: new StringeeResource(pccClient, "/v1/queue"),
  group: new StringeeResource(pccClient, "/v1/group"),
  number: new StringeeResource(pccClient, "/v1/number"),
  ivrTree: new StringeeResource(pccClient, "/v1/ivr/tree"),
  sipAccount: new StringeeResource(pccClient, "/v1/sip/account"),
};
