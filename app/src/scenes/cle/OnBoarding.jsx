import React, { useState, useEffect } from "react";
import queryString from "query-string";
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
    Vous êtes invité(e) par votre référent <strong>{refName}</strong> à vous inscrire dès maintenant au programme “Classe engagée” du SNU.
  </span>
);

const fetchClasse = async (id) => api.get(`/cle/classe/${id}`);

const OnBoarding = () => {
  const [classe, setClasse] = useState(null);
  const { id } = queryString.parse(location.search);

  useEffect(() => {
    (async () => {
      if (classe) return;
      const { data, ok } = await fetchClasse(id);
      if (!ok) return toastr.error("Impossible de joindre le service.");
      const { name, coloration, seatsTaken, totalSeats, referentClasse, etablissement } = data;
      setClasse({
        name,
        coloration,
        isFull: parseInt(totalSeats) - parseInt(seatsTaken) <= 0,
        referent: `${referentClasse.firstName} ${referentClasse.lastName}`,
        etablissement: etablissement.name,
        dateStart: "À venir",
      });
    })();
  }, [id, classe]);

  const fields = [
    {
      label: "Nom",
      value: classe?.name,
    },
    {
      label: "coloration",
      value: classe?.coloration,
    },
    {
      label: "Établissement scolaire",
      value: classe?.etablissement,
    },
    {
      label: "Date de séjour",
      value: classe?.dateStart,
    },
  ];

  return (
    <DSFRLayout title="Inscription de l'élève">
      {classe && (
        <DSFRContainer title={<Title />} subtitle={<Subtitle refName={classe.referent} />}>
          <List title={"Ma classe engagée"} fields={fields}></List>
          {!classe.isFull && (
            <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex sm:flex-col-reverse md:flex-row justify-end">
              <InlineButton className="pt-2 md:pr-2" onClick={function noRefCheck() {}}>
                J'ai déjà un compte volontaire
              </InlineButton>
              <Button onClick={function noRefCheck() {}}>Démarrer mon inscription</Button>
            </div>
          )}
          {classe.isFull && (
            <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex flex-col justify-end">
              <Button className="sm:w-full md:w-52 md:self-end" disabled onClick={function noRefCheck() {}}>
                Classe complète
              </Button>
              <span className="md:self-end">Pour plus d'informations contactez votre référent.</span>
            </div>
          )}
        </DSFRContainer>
      )}
    </DSFRLayout>
  );
};

export default OnBoarding;
