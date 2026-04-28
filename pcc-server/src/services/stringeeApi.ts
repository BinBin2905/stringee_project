import { env } from "../env.js";
import { StringeeClient } from "./stringeeClient.js";
import { StringeeResource } from "./stringeeResource.js";

export const pccClient = new StringeeClient(env.stringeePccApiBase);

// Paths follow developer.stringee.com/docs/icc-rest-api exactly: each PCC
// resource is hosted at a single flat path, not under nested groupings.
export const pcc = {
  agent: new StringeeResource(pccClient, "/v1/agent"),
  queue: new StringeeResource(pccClient, "/v1/queue"),
  group: new StringeeResource(pccClient, "/v1/group"),
  number: new StringeeResource(pccClient, "/v1/number"),
  ivrTree: new StringeeResource(pccClient, "/v1/ivrtree"),
  ivrNode: new StringeeResource(pccClient, "/v1/ivrnode"),
  ivrKeypress: new StringeeResource(pccClient, "/v1/ivrkeypress"),
  sipAccount: new StringeeResource(pccClient, "/v1/ipphonecommon"),
  groupAgent: new StringeeResource(pccClient, "/v1/manage-agents-in-group"),
  groupRouting: new StringeeResource(pccClient, "/v1/routing-call-to-groups"),
  blacklist: new StringeeResource(pccClient, "/v1/blacklistnumber"),
};
