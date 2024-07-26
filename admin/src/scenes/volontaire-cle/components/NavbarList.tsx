import React from "react";
import { useHistory } from "react-router-dom";
import { HiOutlineClipboardList, HiOutlineClipboardCheck } from "react-icons/hi";
import { Navbar } from "@snu/ds/admin";
import { YOUNG_STATUS } from "snu-lib";

export default function NavbarList({
  currentTab,
  setSelectedFilters,
  setSize,
  setParamData,
  studentsWaitingConsent,
  studentsWaitingValidation,
  studentsWaitingImageRights,
  setSelectedYoungs,
  setSelectAll,
}) {
  const history = useHistory();
  return (
    <Navbar
      tab={[
        {
          title: "Général",
          leftIcon: <HiOutlineClipboardList size={20} className="mt-0.5 ml-2.5" />,
          isActive: currentTab === "general",
          onClick: () => {
            setSelectedFilters((prevFilters) => {
              const { reinscriptionStep2023, status, imageRight, ...rest } = prevFilters;
              return rest;
            });
            setSelectedYoungs([]);
            setSelectAll(false);
            setSize(10);
            setParamData({ page: 0 });
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
            setSelectedFilters((prevFilters) => {
              const { status, imageRight, ...rest } = prevFilters;
              return {
                ...rest,
                reinscriptionStep2023: { filter: ["WAITING_CONSENT"] },
              };
            });
            setSelectedYoungs([]);
            setSelectAll(false);
            setSize(10);
            setParamData({ page: 0 });
            history.push(`/mes-eleves?tab=consent`);
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
            setSelectedFilters((prevFilters) => {
              const { reinscriptionStep2023, imageRight, ...rest } = prevFilters;
              return {
                ...rest,
                status: { filter: [YOUNG_STATUS.WAITING_VALIDATION] },
              };
            });
            setSelectedYoungs([]);
            setSelectAll(false);
            setSize(10);
            setParamData({ page: 0 });
            history.push(`/mes-eleves?tab=validation`);
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
            setSelectedFilters((prevFilters) => {
              const { reinscriptionStep2023, status, ...rest } = prevFilters;
              return {
                ...rest,
                imageRight: { filter: ["N/A"] },
              };
            });
            setSelectedYoungs([]);
            setSelectAll(false);
            setSize(10);
            setParamData({ page: 0 });
            history.push(`/mes-eleves?tab=image`);
          },
        },
      ]}
    />
  );
}
