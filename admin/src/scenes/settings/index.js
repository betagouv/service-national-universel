import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { isSuperAdmin } from "snu-lib";
import logo from "../../assets/logo-snu.png";
import Breadcrumbs from "../../components/Breadcrumbs";
import Toggle from "../../components/Toggle";
import { capture } from "../../sentry";
import api from "../../services/api";
import { Title } from "./components/commons";
import Select from "./components/Select";

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
];

export default function Settings() {
  const { user } = useSelector((state) => state.Auth);
  const urlParams = new URLSearchParams(window.location.search);
  const [cohort, setCohort] = React.useState(urlParams.get("cohort") || "Février 2023 - C");
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState({
    name: "",
    snuId: "",
    dateStart: "",
    dateEnd: "",
    pdrChoiceLimitDate: "",
    manualAffectionOpenForAdmin: false,
    manualAffectionOpenForReferentRegion: false,
    manualAffectionOpenForReferentDepartment: false,
    isAssignmentAnnouncementsOpenForYoung: false,
  });

  const getCohort = async () => {
    try {
      const { ok, data: reponseCohort } = await await api.get("/cohort/" + cohort);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du séjour");
      }
      setData({
        name: reponseCohort?.name || "",
        snuId: reponseCohort?.snuId || "",
        dateStart: reponseCohort?.dateStart?.substring(0, 10) || "",
        dateEnd: reponseCohort?.dateEnd?.substring(0, 10) || "",
        pdrChoiceLimitDate: reponseCohort?.pdrChoiceLimitDate?.substring(0, 16) || "",
        manualAffectionOpenForAdmin: reponseCohort?.manualAffectionOpenForAdmin || false,
        manualAffectionOpenForReferentRegion: reponseCohort?.manualAffectionOpenForReferentRegion || false,
        manualAffectionOpenForReferentDepartment: reponseCohort?.manualAffectionOpenForReferentDepartment || false,
        isAssignmentAnnouncementsOpenForYoung: reponseCohort?.isAssignmentAnnouncementsOpenForYoung || false,
      });
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du séjour");
    }
  };

  React.useEffect(() => {
    setIsLoading(true);
    getCohort();
  }, [cohort]);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      delete data.name;
      delete data.snuId;
      const { ok, code } = await api.put(`/cohort/${cohort}`, data);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session", code);
        await getCohort();
        return setIsLoading(false);
      }
      toastr.success("La session a bien été mise à jour");
      await getCohort();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session");
      await getCohort();
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin(user))
    return (
      <div className="flex flex-col h-100 items-center justify-center m-6">
        <img src={logo} alt="logo" className="w-56 pb-8" />
        <div className="text-3xl text-center pb-4">Vous n&apos;avez pas les droits d&apos;accès à cette page !</div>
        <div className="text-center text-lg mt-4 text-gray-500">
          Besoin d&apos;aide ?{" "}
          <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="hover:underline scale-105 cursor-pointer">
            Cliquez ici
          </a>
        </div>
      </div>
    );

  return (
    <>
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        <div className="py-8 flex items-center justify-between">
          <Title>Paramètres séjour {data?.name}</Title>
          <Select
            options={cohortList}
            value={cohort}
            onChange={(e) => {
              setCohort(e);
            }}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-col rounded-xl pt-8 pb-12 px-8 bg-white gap-8">
            <div className="flex">
              <div className="flex flex-col w-[45%] gap-4">
                <div className="text-lg leading-6 font-medium text-gray-900">Informations géneral </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="name" className="w-1/4 text-sm text-gray-700 m-0">
                    Nom
                  </label>
                  <input
                    disabled={true}
                    value={data.name}
                    type="text"
                    id="name"
                    className="flex flex-1 px-2 py-1 rounded-md border-[1px] border-gray-300  focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="id" className="w-1/4 text-sm text-gray-700 m-0">
                    Identifiant
                  </label>
                  <input
                    disabled={true}
                    value={data.snuId}
                    type="text"
                    id="name"
                    className="flex flex-1 px-2 py-1 rounded-md border-[1px] border-gray-300  focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                  />
                </div>
                <div className="text-lg leading-6 font-medium text-gray-900">Dates</div>
                <div className="flex items-center gap-4">
                  <label htmlFor="start-date" className="w-1/4 text-sm text-gray-700 m-0">
                    Date de début
                  </label>
                  <input
                    disabled={isLoading}
                    value={data.dateStart}
                    onChange={(e) => setData({ ...data, dateStart: e.target.value })}
                    type="date"
                    id="start-date"
                    className="flex flex-1 px-2 py-1 rounded-md border-[1px] border-gray-300  focus:border-blue-600 focus:ring-blue-600 sm:text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="end-date" className="w-1/4 text-sm text-gray-700 m-0">
                    Date de fin
                  </label>
                  <input
                    disabled={isLoading}
                    value={data.dateEnd}
                    onChange={(e) => setData({ ...data, dateEnd: e.target.value })}
                    type="date"
                    id="end-date"
                    className="flex flex-1 px-2 py-1 rounded-md border-[1px] border-gray-300  focus:border-blue-600 focus:ring-blue-600 sm:text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="PDR" className="w-1/4 text-sm text-gray-700 m-0">
                    Date / Heure de fin choix PDR
                  </label>
                  <input
                    disabled={isLoading}
                    value={data.pdrChoiceLimitDate}
                    onChange={(e) => setData({ ...data, pdrChoiceLimitDate: e.target.value })}
                    type="datetime-local"
                    id="PDR"
                    className="flex flex-1 px-2 py-1 rounded-md border-[1px] border-gray-300  focus:border-blue-600 focus:ring-blue-600 sm:text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
              <div className="flex w-[10%] justify-center items-center">
                <div className="w-[1px] h-[90%] border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex flex-col w-[45%] gap-4">
                <div className="text-lg leading-6 font-medium text-gray-900">Affectation</div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 m-0">Affectation Admin</label>
                  <Toggle
                    disabled={isLoading}
                    value={data.manualAffectionOpenForAdmin}
                    onChange={() => setData({ ...data, manualAffectionOpenForAdmin: !data.manualAffectionOpenForAdmin })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className=" text-sm text-gray-700 m-0">Affectation référent region</label>
                  <Toggle
                    disabled={isLoading}
                    value={data.manualAffectionOpenForReferentRegion}
                    onChange={() => setData({ ...data, manualAffectionOpenForReferentRegion: !data.manualAffectionOpenForReferentRegion })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 m-0">Affectation référent departements</label>
                  <Toggle
                    disabled={isLoading}
                    value={data.manualAffectionOpenForReferentDepartment}
                    onChange={() => setData({ ...data, manualAffectionOpenForReferentDepartment: !data.manualAffectionOpenForReferentDepartment })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 m-0">Affectation ouverte pour les jeunes</label>
                  <Toggle
                    disabled={isLoading}
                    value={data.isAssignmentAnnouncementsOpenForYoung}
                    onChange={() => setData({ ...data, isAssignmentAnnouncementsOpenForYoung: !data.isAssignmentAnnouncementsOpenForYoung })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                disabled={isLoading}
                className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onSubmit}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
