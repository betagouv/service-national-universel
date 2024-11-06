import { apiURL } from "@/config";

export async function createLead({ email, birthdate, isAbroad, region }: { email: string; birthdate: string; isAbroad: boolean; region?: string }) {
  const res = await fetch(`${apiURL}/preinscription/create-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, birthdate, region, isAbroad }),
  });

  const { ok, data, code, message } = await res.json();

  if (!ok) {
    throw new Error(code, message);
  }

  return data;
}
