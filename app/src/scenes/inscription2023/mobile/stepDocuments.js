import React from "react";
import { Link, useHistory } from "react-router-dom";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Navbar from "../components/Navbar";
import StickyButton from "../../../components/inscription/stickyButton";
import Footer from "../../../components/footerV2";

export default function StepDocuments({ step }) {
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
    <>
      <Navbar step={step} />
      <div className="bg-white p-4">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Ma pièce d’identité</h1>
          <Link to="/public-besoin-d-aide/">
            <QuestionMarkBlueCircle />
          </Link>
        </div>
        <div className="text-gray-800 mt-2 text-sm">Choisissez le justificatif d’identité que vous souhaitez importer :</div>
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
      </div>
      <Footer marginBottom={"12vh"} />
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/representants")} disabled />
    </>
  );
}
