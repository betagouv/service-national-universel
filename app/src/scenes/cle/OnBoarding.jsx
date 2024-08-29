import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import queryString from "query-string";
import { Modal } from "reactstrap";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import TitleImage from "../../assets/onboarding-cle.png";
import MyClass from "./MyClass";
import { ModalContainer } from "../../components/modals/Modal";
import CloseSvg from "../../assets/Close";
import plausibleEvent from "@/services/plausible";
import useAuth from "@/services/useAuth";
import { fetchClass } from "@/services/classe.service";
import { validateId } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import Loader from "@/components/Loader";
import { RiArrowLeftLine } from "react-icons/ri";
import { STATUS_CLASSE } from "snu-lib";
import { Button } from "@snu/ds/dsfr";

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
  return (
    <Modal centered isOpen={isOpen} toggle={onCancel || onChange} size={"md"}>
      <ModalContainer>
        <CloseSvg className="close-icon" height={10} width={10} onClick={onCancel || onChange} />
        <div className="px-8 pb-8">
          <div className="flex gap-6 text-2xl text-black font-semibold">
            <p>→</p>
            <p>J’ai déjà démarré mon inscription dans ma Classe engagée</p>
          </div>
          <Link to="/auth">
            <p className="bg-blue-france-sun-113 hover:bg-blue-france-sun-113-hover text-white w-full p-2.5 text-center my-4">Me connecter</p>
          </Link>
          <hr />

          <div className="flex gap-6 text-2xl text-black font-semibold my-4">
            <p>→</p>
            <p>Je suis inscrit(e) en tant que volontaire</p>
          </div>

          <p>Vous avez un compte hors Classes engagées ? Contactez le support pour mettre à jour votre compte et vous faire gagner du temps.</p>

          <Link to={`/besoin-d-aide?parcours=CLE&q=HTS_TO_CLE&classeId=${id}`}>
            <p
              onClick={() => plausibleEvent("CLE/CTA preinscription - contact support")}
              className="bg-blue-france-sun-113 hover:bg-blue-france-sun-113-hover text-white w-full p-2.5 text-center my-4">
              Contacter le support
            </p>
          </Link>
        </div>
      </ModalContainer>
    </Modal>
  );
};

const OnBoarding = () => {
  const { isLoggedIn, logout } = useAuth();
  if (isLoggedIn) logout({ redirect: false });
  const { id } = queryString.parse(window.location.search);
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
  console.log(classe);
  if (isError)
    return <OnboardingError message="Impossible de joindre le service. Essayez de vérifier le lien d'inscription qui vous a été transmis. Sinon, veuillez réessayer plus tard." />;

  if (classe.status !== STATUS_CLASSE.OPEN) {
    return (
      <DSFRLayout title="Inscription de l'élève">
        <DSFRContainer title="Les inscriptions sont cloturées">
          <p className="leading-relaxed">Les inscriptions dans le cadre des classes engagées ont été clôturées pour l'année scolaire 2023 - 2024.</p>
        </DSFRContainer>
      </DSFRLayout>
    );
  }

  return <OnboardingContent classe={classe} />;
};

const OnboardingContent = ({ classe }) => {
  const history = useHistory();
  const [showContactSupport, setShowContactSupport] = useState(false);

  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title />} subtitle={<Subtitle refName={classe.referent} />}>
        <MyClass classe={classe} />
        <hr className="my-4" />
        <div className="fixed shadow-[0_-15px_5px_-15px_rgba(0,0,0,0.3)] md:shadow-none md:relative bottom-0 w-full bg-white left-0 sm:p-3 md:p-0 md:pt-3 flex sm:flex-col-reverse md:flex-row justify-end">
          <Button className="md:pr-4 pt-2 pb-1" priority="tertiary no outline" onClick={() => setShowContactSupport(true)}>
            J'ai déjà un compte
          </Button>
          <Button
            onClick={() => {
              plausibleEvent("CLE/CTA preinscription - demarrer");
              history.push(`/preinscription/profil?parcours=CLE&classeId=${classe.id}`);
            }}>
            Démarrer mon inscription
          </Button>
        </div>

        <ModalInfo isOpen={showContactSupport} onCancel={() => setShowContactSupport(false)} id={classe.id}></ModalInfo>
      </DSFRContainer>
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
