import { http } from "@/lib/http";

export async function getClientToken(userId: string): Promise<string> {
  const res = await http.post<{ token: string }>("/api/token", { id: userId });
  return res.data.token;
}
