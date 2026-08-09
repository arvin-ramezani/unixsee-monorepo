import { SERVERS, type ServerType } from "@/lib/data/servers-data";

let runtimeServers: ServerType[] = SERVERS.map((server) => ({
  ...server,
  discoveries: server.discoveries.map((discovery) => ({ ...discovery })),
  websiteIds: [...server.websiteIds],
  agent: { ...server.agent },
  enrollment: { ...server.enrollment },
}));

export function listRuntimeServers() {
  return runtimeServers;
}

export function getRuntimeServer(id: string) {
  return runtimeServers.find((server) => server.id === id);
}

export function setRuntimeServers(servers: ServerType[]) {
  runtimeServers = servers;
}

export function upsertRuntimeServer(server: ServerType) {
  const index = runtimeServers.findIndex((item) => item.id === server.id);

  if (index === -1) {
    runtimeServers = [server, ...runtimeServers];
    return;
  }

  runtimeServers = runtimeServers.map((item) =>
    item.id === server.id ? server : item,
  );
}
