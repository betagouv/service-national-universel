export type AlerteMessageDto = {
  _id?: string;
  priority: "normal" | "important" | "urgent";
  to_role: string[];
  title?: string;
  content: string;
  createdAt: Date;
};
