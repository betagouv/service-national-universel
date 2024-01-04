import React, { useState } from "react";
import { Link, Redirect, useHistory } from "react-router-dom";
import queryString from "query-string";
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
import { fetchClass } from "@/services/classe.service";
import { validateId } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import Loader from "@/components/Loader";
import { RiArrowLeftLine } from "react-icons/ri";

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
    plausibleEvent("CLE/CTA preinscription - contact support");
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
  if (isLoggedIn) logout({ redirect: false });
  const { id } = queryString.parse(window.location.search);

  if (!validateId(id)) {
    plausibleEvent("CLE preinscription - id invalide dans l'url");
    return <OnboardingError message="Identifiant invalide. Veuillez vérifier le lien d'inscription qui vous a été transmis." />;
  }
  return <OnboardingContent id={id} />;
};

const OnboardingContent = ({ id }) => {
  const history = useHistory();
  const [showContactSupport, setShowContactSupport] = useState(false);
  const {
    isError,
    isPending,
    data: classe,
  } = useQuery({
    queryKey: ["class", id],
    queryFn: () => fetchClass(id),
    enabled: validateId(id),
  });

  if (isPending) return <Loader />;
  if (isError)
    return <OnboardingError message="Impossible de joindre le service. Essayez de vérifier le lien d'inscription qui vous a été transmis. Sinon, veuillez réessayer plus tard." />;
  return (
    <DSFRLayout title="Inscription de l'élève">
      {classe && (
        <DSFRContainer title={<Title />} subtitle={<Subtitle refName={classe.referent} />}>
          <MyClass classe={classe} />
          <hr className="my-4" />
          {classe.isInscriptionOpen && (
            <div className="fixed shadow-[0_-15px_5px_-15px_rgba(0,0,0,0.3)] md:shadow-none md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex sm:flex-col-reverse md:flex-row justify-end">
              <InlineButton
                className="md:pr-4 pt-2 md:pr-2 pb-1"
                onClick={() => {
                  plausibleEvent("CLE/CTA preinscription - compte HTS");
                  setShowContactSupport(true);
                }}>
                J'ai déjà un compte volontaire
              </InlineButton>
              <PrimaryButton
                onClick={() => {
                  plausibleEvent("CLE/CTA preinscription - demarrer");
                  history.push(`/preinscription/profil?parcours=CLE&classeId=${id}`);
                }}>
                Démarrer mon inscription
              </PrimaryButton>
            </div>
          )}

          {!classe.isInscriptionOpen && (
            <div className="fixed shadow-[0_-15px_5px_-15px_rgba(0,0,0,0.3)] md:shadow-none md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex flex-col justify-end">
              <PrimaryButton className="sm:w-full md:w-52 md:self-end" disabled>
                {classe.isFull ? "☹ Classe complète" : "Inscriptions désactivées"}
              </PrimaryButton>
              <span className="text-[13px] md:self-end">Pour plus d'informations contactez votre référent.</span>
            </div>
          )}
          <ModalInfo isOpen={showContactSupport} onCancel={() => setShowContactSupport(false)} id={id}></ModalInfo>
        </DSFRContainer>
      )}
    </DSFRLayout>
  );
};

const OnboardingError = ({ message }) => {
  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title="Une erreur est survenue">
        <ErrorMessage>{message}</ErrorMessage>
        <Link to="/">
          <div className="text-blue-france-sun-113 hover:text-blue-france-sun-113-hover underline underline-offset-4 my-4 flex gap-2 items-center">
            <RiArrowLeftLine />
            <p className="text-sm">Retour à l'accueil</p>
          </div>
        </Link>
      </DSFRContainer>
    </DSFRLayout>
  );
};

export default OnBoarding;
