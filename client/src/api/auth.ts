import { http } from "@/lib/http";

export async function getClientToken(
  userId: string,
  pcc = false,
): Promise<string> {
  const res = await http.post<{ token: string }>("/api/token", {
    id: userId,
    ...(pcc ? { pcc: true } : {}),
  });
  return res.data.token;
}
