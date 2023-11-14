import React from "react";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import TitleImage from "../../assets/onboarding-cle.png";
import { List } from "@snu/ds/dsfr";

const Title = () => (
  <div>
    <img className="w-full md:w-[65%]" src={TitleImage} />
    <h1 className="pt-4 pb-4">Bienvenue dans votre nouvelle classe engagée !</h1>
  </div>
);

const Subtitle = ({ refName }) => (
  <div>
    Vous êtes invité(e) par votre référent <strong>{refName}</strong> à vous inscrire dès maintenant au programme “Classe engagée” du SNU.`
  </div>
);

const OnBoarding = () => {
  const name = "Jean Mi";
  const fields = [
    {
      label: "Nom",
      value: "Cap VERT",
    },
    {
      label: "coloration",
      value: "environnement",
    },
    {
      label: "Établissement scolaire",
      value: "Charles de foucauld",
    },
  ];

  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title />} subtitle={<Subtitle refName={name} />}>
        <List title={"Ma classe engagée"} fields={fields}></List>
      </DSFRContainer>
    </DSFRLayout>
  );
};

export default OnBoarding;
