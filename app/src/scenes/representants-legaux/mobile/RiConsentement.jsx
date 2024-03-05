import React, { useContext } from "react";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import Loader from "@/components/Loader";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";
import { API_RI } from "../commons";
import api from "../../../services/api";

export default function RiConsentement({ parentId }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  const handleAcceptRI = async () => {
    const body = { _id: young._id };
    try {
      const { ok, code } = await api.post(API_RI + `?token=${token}&parent=${parentId}`, body);
      if (!ok) {
        throw new Error(`Erreur lors de l'envoi de la requête : ${code}`);
      }

      history.push(`/representants-legaux/done?token=${token}&fromRI=true`);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la requête", error);
      toastr.error(error.message);
    }
  };

  const onSubmit = () => {
    handleAcceptRI();
  };
  
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
