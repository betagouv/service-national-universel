import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import TitleImage from "../../assets/onboarding-cle.png";
import api from "../../services/api";
import { List } from "@snu/ds/dsfr";

const Title = () => (
  <div>
    <img className="w-full md:w-[65%]" src={TitleImage} />
    <h1 className="pt-4 pb-4">Bienvenue dans votre nouvelle classe engagée !</h1>
  </div>
);

const Subtitle = ({ refName }) => (
  <span>
    Vous êtes invité(e) par votre référent <strong>{refName}</strong> à vous inscrire dès maintenant au programme “Classe engagée” du SNU.`
  </span>
);

const fetchClasse = async ({ id }) => api.get(`/cle/classe/${id}`);

const OnBoarding = () => {
  const [classe, setClasse] = useState(null);
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

  const id = "6556412374be5e9ff2ca4e28";

  useEffect(() => {
    (async () => {
      if (classe) return;
      const { data, ok } = await fetchClasse({ id });
      if (!ok) return toastr.error("Impossible de joindre le service.");
      setClasse(data);
    })();
  }, [classe]);

  console.log("MA CLASSE");
  console.log(classe);
  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title />} subtitle={<Subtitle refName={name} />}>
        <List title={"Ma classe engagée"} fields={fields}></List>
      </DSFRContainer>
    </DSFRLayout>
  );
};

export default OnBoarding;
