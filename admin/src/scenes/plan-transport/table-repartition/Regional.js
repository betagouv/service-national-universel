import React from "react";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { SubTitle, Title } from "../components/commons";
import Select from "../components/Select";
import { InTable } from "./components/InTable";
import { OutTable } from "./components/OutTable";

export default function Regional() {
  const user = useSelector((state) => state.Auth.user);
  const urlParams = new URLSearchParams(window.location.search);
  const region = urlParams.get("region");
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
      <Breadcrumbs items={[{ label: "Table de répartition", to: "/table-repartition" }, { label: region }]} />
      <div className="flex flex-col w-full px-8 pb-8 ">
        {/* HEADER */}
        <div className="py-8 flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Title>Table de répartition </Title>
              <div className="text-2xl text-gray-600 leading-7">{region}</div>
            </div>
            {user.role !== ROLES.REFERENT_DEPARTMENT && <SubTitle>Assignez les départements d’accueil des volontaires de {region}</SubTitle>}
          </div>
          <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
        </div>

        {/* TABLE */}
        <OutTable cohort={cohort} region={region} user={user} />

        {/* Reverse View */}
        <div className="py-8 flex flex-col gap-2 items-center">
          {/* TOGGLE REVERSE VIEW */}
          <div className="text-lg font-medium text-gray-800 leading-7">
            {openReverseView ? "Masquer" : "Voir"} les territoires accueillis en {region}
          </div>
          <div className="p-2.5 shadow bg-white rounded-full">
            <BsChevronDown
              className={`text-gray-700 font-bold h-4 w-4 cursor-pointer ${openReverseView ? "rotate-180" : ""}`}
              onClick={() => setOpenReverseView(!openReverseView)}
            />
          </div>
        </div>
        {openReverseView && <InTable cohort={cohort} region={region} />}
      </div>
    </>
  );
}
