import React from "react";
import { Link, useHistory } from "react-router-dom";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DesktopPageContainer from "../components/DesktopPageContainer";
import { supportURL } from "../../../config";

export default function StepDocuments() {
  const history = useHistory();

  const IDs = [
    {
      category: "cniNew",
      title: "Carte Nationale d'Identité",
      subtitle: "Nouveau format (après août 2021)",
    },
    {
      category: "cniOld",
      title: "Carte Nationale d'Identité",
      subtitle: "Ancien format",
    },
    {
      category: "passport",
      title: "Passeport",
    },
  ];

  return (
    <DesktopPageContainer
      title="Ma pièce d’identité"
      subTitle="Choisissez le justificatif d’identité que vous souhaitez importer :"
      onClickPrevious={() => history.push("/inscription2023/representants")}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {IDs.map((id) => (
        <Link key={id.category} to={`televersement/${id.category}`}>
          <div className="my-4">
            <div className="border p-4 my-3 flex justify-between items-center">
              <div>
                <div>{id.title}</div>
                {id.subtitle && <div className="text-gray-500 text-sm">{id.subtitle}</div>}
              </div>
              <ArrowRightBlueSquare />
            </div>
          </div>
        </Link>
      ))}
    </DesktopPageContainer>
  );
}
