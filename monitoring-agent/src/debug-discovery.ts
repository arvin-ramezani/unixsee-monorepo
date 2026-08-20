import { initializeIdentity } from "./discovery.js";

const identity = await initializeIdentity();
console.log(JSON.stringify(identity.domains, null, 2));
