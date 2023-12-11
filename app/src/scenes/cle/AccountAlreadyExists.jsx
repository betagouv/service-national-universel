import React from "react";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import PrimaryButton from "@/components/dsfr/ui/buttons/PrimaryButton";
import AccountExistsImage from "@/assets/accountExists.png";
import { supportURL } from "@/config";

const Title = () => (
  <div className="flex items-center">
    <img className="w-8 h-8 mr-2" src={AccountExistsImage} />
    <h1 className="pt-4 pb-4">Attention ! Vous avez déjà un compte Volontaire.</h1>
  </div>
);

const AccountAlreadyExists = () => {
  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title />}>
        <span>Si vous souhaitez participer au SNU dans le cadre des classes engagées, contactez le support pour mettre à jour votre compte et vous faire gagner du temps.</span>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex flex-col justify-end">
          <PrimaryButton className="sm:w-full md:w-52 md:self-end" onClick={() => window.location.replace(`${supportURL}/besoin-d-aide?parcours=CLE&q=HTS_TO_CLE`)}>
            Contacter le support
          </PrimaryButton>
        </div>
      </DSFRContainer>
    </DSFRLayout>
  );
};

export default AccountAlreadyExists;
