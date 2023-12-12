import React from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import PrimaryButton from "@/components/dsfr/ui/buttons/PrimaryButton";
import { supportURL } from "@/config";
import AccountExistsImage from "../inscription2023/assets/error.png";

const Title = () => (
  <div className="flex items-center">
    <img className="w-10 h-10 mt-1 mr-2" src={AccountExistsImage} />
    <h1 className="pt-4 pb-4">Attention ! Vous avez déjà un compte Volontaire.</h1>
  </div>
);

const AccountAlreadyExists = () => {
  const history = useHistory();
  const { classeId, parcours } = queryString.parse(location.search);
  const callBack =
    parcours !== "CLE"
      ? () => window.location.replace(`${supportURL}/base-de-connaissance/je-suis-volontaire-classes-engagees-comment-minscrire`)
      : () => history.push(`/besoin-d-aide?parcours=CLE&q=HTS_TO_CLE&classeId=${classeId}`);

  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title />}>
        <span>Si vous souhaitez participer au SNU dans le cadre des classes engagées, contactez le support pour mettre à jour votre compte et vous faire gagner du temps.</span>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex flex-col justify-end">
          <PrimaryButton className="sm:w-full md:w-52 md:self-end" onClick={callBack}>
            Contacter le support
          </PrimaryButton>
        </div>
      </DSFRContainer>
    </DSFRLayout>
  );
};

export default AccountAlreadyExists;
