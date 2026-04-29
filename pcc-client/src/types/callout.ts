// Callout (agent → customer): the proxy first dials the agent, then
// bridges the agent leg to the customer.

export interface CalloutRequest {
  agentUserId: string;
  toAgentFromNumberDisplay: string;
  toAgentFromNumberDisplayAlias: string;
  toCustomerFromNumber: string;
  customerNumber: string;
}

export interface CalloutResponse {
  r: number;
  message?: string;
  msg?: string;
  callId?: string;
  data?: unknown;
}
