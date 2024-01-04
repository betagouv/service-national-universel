import React from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import PrimaryButton from "@/components/dsfr/ui/buttons/PrimaryButton";
import { supportURL } from "@/config";
import AccountExistsImage from "../inscription2023/assets/error.png";

const Title = ({ children }) => (
  <div className="flex items-center">
    <img className="w-10 h-10 mt-1 mr-2" src={AccountExistsImage} />
    <h1 className="pt-4 pb-4">{children}</h1>
  </div>
);

const AccountAlreadyExists = () => {
  const history = useHistory();
  const { classeId, parcours } = queryString.parse(location.search);
  const [title, callBack, text, additionalText] =
    parcours !== "CLE"
      ? [
          "Attention ! Vous avez déjà un compte.",
          () => window.location.replace(`${supportURL}/base-de-connaissance/je-suis-volontaire-classes-engagees-comment-minscrire`),
          "Si un séjour de cohésion est prévu dans le cadre de votre classe engagée, vous ne pourrez pas vous inscrire également à un séjour de cohésion à titre individuel.",
          "Vous ne pouvez plus participer au séjour de cohésion avec votre classe ? Veuillez contacter directement votre référent classe.",
        ]
      : [
          "Attention ! Vous avez déjà un compte.",
          () => history.push(`/besoin-d-aide?parcours=CLE&q=HTS_TO_CLE&classeId=${classeId}`),
          "Si vous souhaitez participer au SNU dans le cadre des classes engagées, contactez le support pour mettre à jour votre compte et vous faire gagner du temps.",
        ];
  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title>{title}</Title>}>
        <span>
          {text}
          {additionalText && (
            <>
              <br />
              <br />
              {additionalText}
            </>
          )}
        </span>
        <hr className="my-4" />
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
