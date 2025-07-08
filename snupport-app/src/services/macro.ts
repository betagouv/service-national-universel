import API from "./api";

export type Macro = {
  _id: string;
  name: string;
  macroAction: Array<{
    value: string;
    field: string;
    action: string;
    _id: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sendCurrentMessage: boolean;
  stayOnCurrentPage: boolean;
};

export async function getMacros(): Promise<Macro[]> {
  const res = await API.get({ path: "/macro", query: { isActive: true } });
  if (!res.ok) throw new Error(res.code);
  return res.data;
}
