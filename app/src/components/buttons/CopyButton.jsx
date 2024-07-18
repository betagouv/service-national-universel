import React, { useState } from "react";
import { copyToClipboard } from "@/utils";
import { HiCheckCircle } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";

export default function CopyButton({ string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="flex cursor-pointer items-center justify-center hover:scale-105"
      onClick={() => {
        copyToClipboard(string);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }}>
      {copied ? <HiCheckCircle className="text-green-500" /> : <MdOutlineContentCopy className="text-xl text-gray-500" />}
    </button>
  );
}
