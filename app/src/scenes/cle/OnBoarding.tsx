import React from "react";
import { Link, Redirect, useHistory } from "react-router-dom";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import TitleImage from "../../assets/onboarding-cle.png";
import MyClass from "./MyClass";
import { alreadyHaveAnAccountModal } from "../preinscription/components/Modals";
import AlreadyHaveAnAccountModal from "../preinscription/components/AlreadyHaveAnAccountModal";
import plausibleEvent from "@/services/plausible";
import useAuth from "@/services/useAuth";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import Loader from "@/components/Loader";
import { RiArrowLeftLine } from "react-icons/ri";
import { STATUS_CLASSE } from "snu-lib";
import { Button } from "@snu/ds/dsfr";
import useClass from "./useClass";

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

const OnBoarding = () => {
  const { isLoggedIn, logout, isCLE } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  const { isError, isPending, data: classe } = useClass(id);
  if (isLoggedIn && !isCLE) logout();
  if (isLoggedIn && isCLE) return <Redirect to="/inscription" />;
  if (isPending) return <Loader />;
  if (isError)
    return <OnboardingError message="Impossible de joindre le service. Essayez de vérifier le lien d'inscription qui vous a été transmis. Sinon, veuillez réessayer plus tard." />;

  if (classe.status !== STATUS_CLASSE.OPEN) {
    return (
      <DSFRLayout title="Inscription de l'élève">
        <DSFRContainer title="Les inscriptions sont cloturées">
          <p className="leading-relaxed">Les inscriptions dans le cadre des classes engagées sont clôturées pour cette classe.</p>
        </DSFRContainer>
      </DSFRLayout>
    );
  }

  return <OnboardingContent classe={classe} />;
};

const OnboardingContent = ({ classe }) => {
  const history = useHistory();

  return (
    <DSFRLayout title="Inscription de l'élève">
      <DSFRContainer title={<Title />} subtitle={<Subtitle refName={classe.referent} />}>
        <MyClass classe={classe} />
        <hr className="my-4" />
        <div className="fixed sm:z-10 md:z-auto shadow-[0_-15px_5px_-15px_rgba(0,0,0,0.3)] md:shadow-none md:relative bottom-0 w-full bg-white left-0 sm:p-4 md:p-0 md:pt-3 flex sm:flex-col-reverse md:flex-row justify-end">
          <Button priority="tertiary no outline" onClick={() => alreadyHaveAnAccountModal.open()} className="sm:!w-full items-center justify-center bg md:!w-auto">
            J'ai déjà un compte
          </Button>
          <Button
            className={`sm:!w-full items-center justify-center bg md:!w-auto`}
            onClick={() => {
              plausibleEvent("CLE/CTA preinscription - demarrer");
              history.push(`/preinscription/profil?parcours=CLE&classeId=${classe.id}`);
            }}>
            Démarrer mon inscription
          </Button>
        </div>
        <AlreadyHaveAnAccountModal />
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
