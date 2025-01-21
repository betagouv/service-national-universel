import { downloadSecuredFile } from "@/services/file.service";
import React from "react";
import { HiOutlinePaperClip } from "react-icons/hi";

export default function ImportRapportCell({ fileKey }: { fileKey: string | undefined }) {
  if (!fileKey) {
    return null;
  }
  return (
    <button onClick={() => downloadSecuredFile(fileKey)} className="border-[1px] border-blue-600 rounded-full p-2.5">
      <HiOutlinePaperClip size={24} />
    </button>
  );
}
