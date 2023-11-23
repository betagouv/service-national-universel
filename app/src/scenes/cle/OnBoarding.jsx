import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import TitleImage from "../../assets/onboarding-cle.png";
import api from "../../services/api";
import { List } from "@snu/ds/dsfr";
import PrimaryButton from "@/components/dsfr/ui/buttons/PrimaryButton";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";
import { ModalContainer, Content } from "../../components/modals/Modal";
import CloseSvg from "../../assets/Close";

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

const ModalInfo = ({ isOpen, onCancel, onChange }) => (
  <Modal centered isOpen={isOpen} toggle={onCancel || onChange}>
    <ModalContainer>
      <CloseSvg className="close-icon" height={10} width={10} onClick={onCancel || onChange} />
      <Content className="text-left">
        <h1>→ Attention</h1>
        <p>
          Vous avez déjà un compte volontaire et vous souhaitez participer au SNU dans le cadre des classes engagées ? Contactez le support pour mettre à jour votre compte et vous
          faire gagner du temps.
        </p>
        <InlineButton className="pt-2 md:pr-2" onClick={function noRefCheck() {}}>
          Contacter le support
        </InlineButton>
      </Content>
    </ModalContainer>
  </Modal>
);

const fetchClasse = async (id) => api.get(`/cle/classe/${id}`);

const OnBoarding = () => {
  const [classe, setClasse] = useState(null);
  const history = useHistory();
  const [showContactSupport, setShowContactSupport] = useState(false);
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
      label: "Coloration",
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
          <hr className="my-4 h-px border-0 bg-gray-200" />
          {!classe.isFull && (
            <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex sm:flex-col-reverse md:flex-row justify-end">
              <InlineButton className="md:pr-4 pt-2 md:pr-2 pb-1" onClick={() => setShowContactSupport(true)}>
                J'ai déjà un compte volontaire
              </InlineButton>
              <PrimaryButton onClick={() => history.push(`/preinscription/profil?parcours=CLE&classeId=${id}`)}>Démarrer mon inscription</PrimaryButton>
            </div>
          )}
          {classe.isFull && (
            <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex flex-col justify-end">
              <PrimaryButton className="sm:w-full md:w-52 md:self-end" disabled>
                Classe complète
              </PrimaryButton>
              <span className="md:self-end">Pour plus d'informations contactez votre référent.</span>
            </div>
          )}
          <ModalInfo isOpen={showContactSupport} onCancel={() => setShowContactSupport(false)}></ModalInfo>
        </DSFRContainer>
      )}
    </DSFRLayout>
  );
};

export default OnBoarding;
