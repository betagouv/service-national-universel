import React, { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { ROLES } from "snu-lib";

import useDocumentTitle from "@/hooks/useDocumentTitle";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { Loading, SubTitle, Title } from "../components/commons";

import { InTable } from "./components/InTable";
import { OutTable } from "./components/OutTable";

export default function Regional() {
  const history = useHistory();

  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);

  const urlParams = new URLSearchParams(history.location.search);
  const region = urlParams.get("region");
  useDocumentTitle(`Table de répartition - ${region}`);

  const [cohort, setCohort] = useState(urlParams.get("cohort") || cohorts?.[0]?.name);

  const [openReverseView, setOpenReverseView] = useState(false);

  if (!cohort || !region) return <Loading />;

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
          <SelectCohort cohort={cohort} onChange={setCohort} />
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
