// Barrel re-export for every PCC REST API type. Keeps existing
// `import { ProxyResult } from "../types/api.js"` imports working while
// letting new code pull resource shapes from one place.
export * from "./api.js";
export * from "./common.js";
export * from "./agent.js";
export * from "./group.js";
export * from "./groupAgent.js";
export * from "./queue.js";
export * from "./groupRouting.js";
export * from "./ivrTree.js";
export * from "./ivrNode.js";
export * from "./ivrKeypress.js";
export * from "./number.js";
export * from "./sipAccount.js";
export * from "./blacklist.js";
export * from "./transferCall.js";
export * from "./callout.js";
