import React from "react";

export default function VolontaireSection({ volontairesData, inAndOutCohort }) {
  const phase1Width =
    Math.min(Math.round(((volontairesData?.VALIDATED?.phase1?.DONE || 0) / (volontairesData?.VALIDATED?.total || 1)) * 100), 100) >= 3
      ? Math.min(Math.round(((volontairesData?.VALIDATED?.phase1?.DONE || 0) / (volontairesData?.VALIDATED?.total || 1)) * 100), 100) + "%"
      : 3 + "%";

  const phase2Width =
    Math.min(Math.round(((volontairesData?.VALIDATED?.phase2?.VALIDATED || 0) / (volontairesData?.VALIDATED?.total || 1)) * 100), 100) >= 3
      ? Math.min(Math.round(((volontairesData?.VALIDATED?.phase2?.VALIDATED || 0) / (volontairesData?.VALIDATED?.total || 1)) * 100), 100) + "%"
      : 3 + "%";

  const phase3Width =
    Math.min(Math.round(((volontairesData?.VALIDATED?.phase3?.VALIDATED || 0) / (volontairesData?.VALIDATED?.total || 1)) * 100), 100) >= 3
      ? Math.min(Math.round(((volontairesData?.VALIDATED?.phase3?.VALIDATED || 0) / (volontairesData?.VALIDATED?.total || 1)) * 100), 100) + "%"
      : 3 + "%";

  return (
    <>
      <h1 className="text-[28px] font-bold leading-8 text-gray-900">Volontaires</h1>
      <div className="flex gap-4">
        <div className="flex w-1/4 flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <p className="text-base font-bold text-gray-900">Volontaires</p>
            <p className="text-2xl font-bold text-gray-900">{volontairesData?.VALIDATED?.total || 0}</p>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <p className="text-base font-bold text-gray-900">Désistements</p>
            <p className="text-2xl font-bold text-gray-900">{volontairesData?.WITHDRAWN?.total || 0}</p>
          </div>
        </div>
        <div className="flex w-1/4 flex-col gap-8 rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
          <p className="text-base font-bold text-gray-900">Changement de cohorte</p>
          <div className="my-auto flex items-center ">
            <div className="flex w-[45%] flex-col items-center justify-center gap-4 ">
              <p className="text-xs text-gray-600">Sorties</p>
              <p className="text-2xl font-bold text-gray-900">{inAndOutCohort?.out || 0}</p>
            </div>
            <div className="flex h-full w-[10%] items-center justify-center">
              <div className="h-full w-[1px] border-r-[1px] border-gray-300 "></div>
            </div>
            <div className="flex w-[45%] flex-col items-center justify-center gap-4">
              <p className="text-xs text-gray-600">Entrées</p>
              <p className="text-2xl font-bold text-gray-900">{inAndOutCohort?.in || 0}</p>
            </div>
          </div>
        </div>
        <div className="flex w-1/2 flex-col gap-2 rounded-lg bg-white p-8 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
          <p className="text-base font-bold text-gray-900">Validations par phases</p>
          <div className="flex gap-4">
            <div className="flex w-[55%] items-center">
              <div className="flex w-[30%] flex-col items-center gap-2">
                <div className="h-[10px] w-[10px] rounded-full bg-blue-800"></div>
                <p className="text-2xl font-bold text-gray-900">{volontairesData?.VALIDATED?.phase1?.DONE || 0}</p>
                <p className="text-center text-xs text-gray-600">Ayant validé la Phase 1</p>
              </div>
              <div className="flex h-full w-[5%] gap-2">
                <div className="m-auto h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex w-[30%] flex-col items-center gap-2">
                <div className="h-[10px] w-[10px] rounded-full bg-blue-800"></div>
                <p className="text-2xl font-bold text-gray-900">{volontairesData?.VALIDATED?.phase2?.VALIDATED || 0}</p>
                <p className="text-center text-xs text-gray-600">Ayant validé la Phase 2</p>
              </div>
              <div className="flex h-full w-[5%] gap-2">
                <div className="m-auto h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex w-[30%] flex-col items-center gap-2">
                <div className="h-[10px] w-[10px] rounded-full bg-blue-800"></div>
                <p className="text-2xl font-bold text-gray-900">{volontairesData?.VALIDATED?.phase3?.VALIDATED || 0}</p>
                <p className="text-center text-xs text-gray-600">Ayant validé la Phase 3</p>
              </div>
            </div>
            <div className="flex w-[45%] flex-col gap-2">
              <div className="w-full">
                <div className="h-8  rounded-full bg-blue-800" style={{ width: phase1Width }}></div>
              </div>
              <div className="w-full">
                <div className="h-8  rounded-full bg-blue-500" style={{ width: phase2Width }}></div>
              </div>
              <div className="w-full">
                <div className="h-8  rounded-full bg-blue-300" style={{ width: phase3Width }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
