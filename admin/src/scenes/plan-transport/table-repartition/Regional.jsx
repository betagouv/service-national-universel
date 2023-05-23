import React from "react";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { SubTitle, Title } from "../components/commons";
import Select from "../components/Select";
import { InTable } from "./components/InTable";
import { OutTable } from "./components/OutTable";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

export default function Regional() {
  const user = useSelector((state) => state.Auth.user);
  const urlParams = new URLSearchParams(window.location.search);
  const region = urlParams.get("region");
  useDocumentTitle(`Table de répartition - ${region}`);
  const [cohort, setCohort] = React.useState(urlParams.get("cohort"));
  const cohortList = [
    { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
    { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
    { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
    { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
    { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
  ];

  const [openReverseView, setOpenReverseView] = React.useState(false);

  return (
    <>
      <Breadcrumbs items={[{ label: "Table de répartition", to: `/table-repartition${cohort && `?cohort=${cohort}`}` }, { label: region }]} />
      <div className="flex w-full flex-col px-8 pb-8 ">
        {/* HEADER */}
        <div className="flex items-center justify-between py-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Title>Table de répartition </Title>
              <div className="text-2xl leading-7 text-gray-600">{region}</div>
            </div>
            {user.role !== ROLES.REFERENT_DEPARTMENT && <SubTitle>Assignez les départements d&apos;accueil des volontaires de {region}</SubTitle>}
          </div>
          <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
        </div>

        {/* TABLE */}
        <OutTable cohort={cohort} region={region} user={user} />

        {/* Reverse View */}
        <div className="flex flex-col items-center gap-2 py-8">
          {/* TOGGLE REVERSE VIEW */}
          <div className="text-lg font-medium leading-7 text-gray-800">
            {openReverseView ? "Masquer" : "Voir"} les territoires accueillis en {region}
          </div>
          <div className="rounded-full bg-white p-2.5 shadow">
            <BsChevronDown
              className={`h-4 w-4 cursor-pointer font-bold text-gray-700 ${openReverseView ? "rotate-180" : ""}`}
              onClick={() => setOpenReverseView(!openReverseView)}
            />
          </div>
        </div>
        {openReverseView && <InTable cohort={cohort} region={region} />}
      </div>
    </>
  );
}
