import API from "./api";

export type MessageMacro = {
  _id: string;
  text: string;
  content: Array<{
    type: string;
    children: any[];
  }>;
  name: string;
};

export type Macro = {
  _id: string;
  name: string;
  macroAction: Array<{
    value: string;
    field: string;
    action: string;
    _id: string;
    message?: MessageMacro;
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

export async function getMacroById(id: string): Promise<Macro> {
  const res = await API.get({ path: `/macro/${id}` });
  if (!res.ok) throw new Error(res.code);
  return res.data;
}
