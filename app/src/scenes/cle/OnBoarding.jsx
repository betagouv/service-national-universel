import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import TitleImage from "../../assets/onboarding-cle.png";
import MyClass from "./MyClass";
import PrimaryButton from "@/components/dsfr/ui/buttons/PrimaryButton";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";
import { ModalContainer, Content } from "../../components/modals/Modal";
import CloseSvg from "../../assets/Close";
import plausibleEvent from "@/services/plausible";
import useAuth from "@/services/useAuth";
import { useClass } from "@/services/useClass";

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

const ModalInfo = ({ isOpen, onCancel, onChange, id }) => {
  const history = useHistory();
  const handleClick = (id) => {
    // TODO: add correct plausible event
    plausibleEvent("TBD");
    history.push(`/besoin-d-aide?parcours=CLE&q=HTS_TO_CLE&classeId=${id}`);
  };

  return (
    <Modal centered isOpen={isOpen} toggle={onCancel || onChange}>
      <ModalContainer>
        <CloseSvg className="close-icon" height={10} width={10} onClick={onCancel || onChange} />
        <Content className="text-left">
          <h1>→ Attention</h1>
          <p>
            Vous avez déjà un compte volontaire et vous souhaitez participer au SNU dans le cadre des classes engagées ? Contactez le support pour mettre à jour votre compte et
            vous faire gagner du temps.
          </p>
          <InlineButton className="pt-2 md:pr-2" onClick={() => handleClick(id)}>
            Contacter le support
          </InlineButton>
        </Content>
      </ModalContainer>
    </Modal>
  );
};

const OnBoarding = () => {
  const { isLoggedIn, logout } = useAuth();
  const history = useHistory();
  const [showContactSupport, setShowContactSupport] = useState(false);
  const { id } = queryString.parse(location.search);

  if (isLoggedIn) logout({ redirect: false });
  const { classe, isError } = useClass(id);
  if (isError) toastr.error("Impossible de joindre le service.");

  return (
    <DSFRLayout title="Inscription de l'élève">
      {classe && (
        <DSFRContainer title={<Title />} subtitle={<Subtitle refName={classe.referent} />}>
          <MyClass classe={classe} />
          <hr className="my-4 h-px border-0 bg-gray-200" />
          {classe.isInscriptionOpen && (
            <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex sm:flex-col-reverse md:flex-row justify-end">
              <InlineButton className="md:pr-4 pt-2 md:pr-2 pb-1" onClick={() => setShowContactSupport(true)}>
                J'ai déjà un compte volontaire
              </InlineButton>
              <PrimaryButton onClick={() => history.push(`/preinscription/profil?parcours=CLE&classeId=${id}`)}>Démarrer mon inscription</PrimaryButton>
            </div>
          )}
          {!classe.isInscriptionOpen && (
            <div className="fixed md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex flex-col justify-end">
              <PrimaryButton className="sm:w-full md:w-52 md:self-end" disabled>
                {classe.isFull ? "Classe complète" : "Inscriptions désactivées"}
              </PrimaryButton>
              <span className="md:self-end">Pour plus d'informations contactez votre référent.</span>
            </div>
          )}
          <ModalInfo isOpen={showContactSupport} onCancel={() => setShowContactSupport(false)} id={id}></ModalInfo>
        </DSFRContainer>
      )}
    </DSFRLayout>
  );
};

export default OnBoarding;
