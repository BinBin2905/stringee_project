import backendApi from "./axios";

export async function getClientToken(userId: string): Promise<string> {
  const res = await backendApi.post("/api/token", { id: userId });
  return res.data.token;
}
