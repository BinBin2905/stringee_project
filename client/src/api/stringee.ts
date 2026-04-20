import backendApi from "./axios";

export async function getClientToken(userId: string): Promise<string> {
  const res = await backendApi.post("/api/token", { id: userId });

  if (!res) throw new Error(`Server trả về ${res.status}`);

  return res.data.token;
}
