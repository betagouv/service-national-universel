import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import TitleImage from "../../assets/onboarding-cle.png";
import api from "../../services/api";
import { List } from "@snu/ds/dsfr";
import Button from "@/components/dsfr/ui/buttons/Button";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";

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

const fetchClasse = async (id) => api.get(`/cle/classe/${id}`);

const OnBoarding = () => {
  const [classe, setClasse] = useState(null);
  let { id } = useParams();
  console.log(`ID IS ${id}`);
  const name = "Jean Mi";
  const fields = [
    {
      label: "Nom",
      value: "",
    },
    {
      label: "coloration",
      value: "environnement",
    },
    {
      label: "Établissement scolaire",
      value: "Charles de foucauld",
    },
    {
      label: "Date de séjour",
      value: "Charles de foucauld",
    },
  ];

  // const id = "6556412374be5e9ff2ca4e28";

  useEffect(() => {
    (async () => {
      if (classe) return;
      const { data, ok } = await fetchClasse(id);
      if (!ok) return toastr.error("Impossible de joindre le service.");
      setClasse(data);
    })();
  }, [id, classe]);

  console.log("MA CLASSE");
  console.log(classe);
  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title />} subtitle={<Subtitle refName={name} />}>
        <List title={"Ma classe engagée"} fields={fields}></List>
        <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex sm:flex-col-reverse md:flex-row justify-end">
          <InlineButton className="pt-2 md:pr-2" onClick={function noRefCheck() {}}>
            J'ai déjà un compte volontaire
          </InlineButton>
          <Button onClick={function noRefCheck() {}}>Démarrer mon inscription</Button>
        </div>
      </DSFRContainer>
    </DSFRLayout>
  );
};

export default OnBoarding;
