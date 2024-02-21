import React, { useContext } from "react";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import Loader from "@/components/Loader";
import { useHistory } from "react-router-dom";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";

export default function RiConsentement() {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  function onSubmit() {
    history.push(`/representants-legaux/done?token=${token}&fromRI=true`);
  }
  //   J’accepte le règlement intérieur
  if (!young) return <Loader />;

  return (
    <>
      <DSFRLayout>
        <DSFRContainer>
          <div className="flex flex-col gap-4">
            <hr className="my-2 h-px border-0 bg-gray-200 md:hidden" />
            <div className="flex items-center gap-4">
              <h1 className="flex-1 text-[22px] font-bold">Le règlement intérieur a été mis à jour</h1>
            </div>
            <hr className="my-2 h-px border-0 bg-gray-200" />
            <p className="text-base text-[#161616]">
              Dans le cadre de la participation de {young.firstName} {young.lastName} au SNU, nous vous demandons de bien vouloir accepter le nouveau{" "}
              <a
                href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/SNU-reglement-interieur-2024.pdf"
                target="_blank"
                rel="noreferrer"
                className="underline hover:underline">
                règlement intérieur
              </a>
              .
            </p>
            <SignupButtonContainer onClickNext={onSubmit} labelNext="J’accepte le règlement intérieur" />
          </div>
        </DSFRContainer>
      </DSFRLayout>
    </>
  );
}
