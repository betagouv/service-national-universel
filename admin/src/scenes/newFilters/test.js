import React, { useState } from "react";
import { useEffect } from "react";
import { translateGrade } from "snu-lib";
import ListFiltersPopOver from "./ListFiltersPopOver";

export default function test() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);

  const searchBarObject = {
    placeholder: "Rechercher par prénom, nom, email, ville...",
    datafield: ["lastName.keyword", "firstName.keyword", "email.keyword", "city.keyword"],
  };
  const filterArray = [
    { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Région", name: "region", datafield: "region.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Département", name: "department", datafield: "department.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Classe", name: "grade", datafield: "grade.keyword", parentGroup: "Dossier", translate: translateGrade, missingLabel: "Non renseignée" },
    { title: "Custom", name: "example", datafield: "example.keyword", parentGroup: "Dossier", customComponent: "example" },
  ];

  const defaultQuery = { query: { bool: { must: [{ match_all: {} }] } } };
  const getCount = (value) => {
    setCount(value);
  };

  useEffect(() => {
    console.log("data", data);
  }, [data]);
  //extract dans utils ou logique du filtre ?

  return (
    <div className="bg-white h-full">
      <div className="flex flex-col gap-8 m-4">
        <div>{count} résultats</div>
        <ListFiltersPopOver
          pageId="young"
          esId="young"
          defaultQuery={defaultQuery}
          filters={filterArray}
          getCount={getCount}
          setData={(value) => setData(value)}
          searchBarObject={searchBarObject}
        />
        {/* display currentfilters */}
      </div>
    </div>
  );
}
