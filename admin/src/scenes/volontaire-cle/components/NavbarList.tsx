import React from "react";
import { useHistory } from "react-router-dom";
import { HiOutlineClipboardList, HiOutlineClipboardCheck } from "react-icons/hi";

import { Navbar } from "@snu/ds/admin";

interface Props {
  currentTab: "general" | "consent" | "validation" | "image";
  studentsWaitingConsent: number;
  studentsWaitingValidation: number;
  studentsWaitingImageRights: number;
}

export default function NavbarList({ currentTab, studentsWaitingConsent, studentsWaitingValidation, studentsWaitingImageRights }: Props) {
  const history = useHistory();
  return (
    <Navbar
      tab={[
        {
          title: "Général",
          leftIcon: <HiOutlineClipboardList size={20} className="mt-0.5 ml-2.5" />,
          isActive: currentTab === "general",
          onClick: () => {
            history.push(`/mes-eleves`);
          },
        },
        {
          title: (
            <div className="flex gap-2 items-center">
              <span>Récolte des consentements</span>
              <div className={`rounded-full h-6 w-[26px] flex justify-center items-center ${currentTab === "consent" ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}>
                {studentsWaitingConsent}
              </div>
            </div>
          ),
          label: "Étape 1",
          leftIcon: <HiOutlineClipboardCheck size={20} className="mt-0.5 ml-2.5" />,
          isActive: currentTab === "consent",
          onClick: () => {
            history.push(`/mes-eleves/consent`);
          },
        },
        {
          title: (
            <div className="flex gap-2 items-center">
              <span>Validation des inscriptions</span>
              <div className={`rounded-full h-6 w-[26px] flex justify-center items-center ${currentTab === "validation" ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}>
                {studentsWaitingValidation}
              </div>
            </div>
          ),
          label: "Étape 2",
          leftIcon: <HiOutlineClipboardCheck size={20} className="mt-0.5 ml-2.5" />,
          isActive: currentTab === "validation",
          onClick: () => {
            history.push(`/mes-eleves/validation`);
          },
        },
        {
          title: (
            <div className="flex gap-2 items-center">
              <span>Récolte des droits à l'image</span>
              <div className={`rounded-full h-6 w-[26px] pb-0.5 flex justify-center items-center ${currentTab === "image" ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}>
                {studentsWaitingImageRights}
              </div>
            </div>
          ),
          label: "Étape 3 (non bloquante)",
          leftIcon: <HiOutlineClipboardCheck size={20} className="mt-0.5 ml-2.5" />,
          isActive: currentTab === "image",
          onClick: () => {
            history.push(`/mes-eleves/image`);
          },
        },
      ]}
    />
  );
}
