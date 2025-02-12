import { MissionAndApplicationType } from "@/scenes/phase2/engagement.repository";
import useUpdateApplicationStatus from "@/scenes/phase2/lib/useUpdateApplicationStatus";
import React from "react";
import { BiXCircle } from "react-icons/bi";
import { APPLICATION_STATUS } from "snu-lib";

export default function DeclineButton({ mission }: { mission: MissionAndApplicationType }) {
  const { mutate, isPending } = useUpdateApplicationStatus(mission.application!._id);
  return (
    <button
      className="flex gap-2 rounded-lg px-4 py-2 border transition duration-300 ease-in-out hover:bg-gray-50 disabled:bg-gray-200"
      disabled={isPending}
      onClick={() => mutate(APPLICATION_STATUS.CANCEL)}>
      <BiXCircle className="h-5 w-5 text-red-500" />
      <span className="text-sm font-medium">Décliner</span>
    </button>
  );
}
