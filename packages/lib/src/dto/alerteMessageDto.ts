export type AlerteMessageDto = {
  _id?: string;
  priority: "normal" | "important" | "urgent";
  to_role: string[];
  content: string;
  createdAt: Date;
};
