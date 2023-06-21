import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import jeVauxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";
import Error from "../../../components/error";
import Avatar from "../assets/avatar.png";
import ErrorPic from "../assets/error.png";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../redux/auth/actions";
import Footer from "../../../components/footerV2";
import EditPen from "../../../assets/icons/EditPen";
import StickyButton from "../../../components/inscription/stickyButton";
import ConsentDone from "../../../assets/icons/ConsentDone";

const engagementPrograms = [
  {
    title: "Service civique",
    description:
      "Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques, dans 9 domaines d’actions jugés « prioritaires pour la Nation » : solidarité, santé, éducation pour tous, culture et loisirs, sport, environnement, mémoire et citoyenneté, développement international et action humanitaire, intervention d’urgence. Il permet de développer sa citoyenneté comme ses compétences professionnelles.",
    picture: serviceCivique,
    link: "https://www.service-civique.gouv.fr/",
  },
  {
    title: "JeVeuxAider.gouv.fr par la Réserve Civique",
    description:
      "Un dispositif d’engagement civique accessible à tous, auprès d’organisations publiques ou associatives, dans dix domaines d’action : santé, éducation, protection de l’environnement, culture, sport, protection ... la liste complète est disponible ici.)",
    picture: jeVauxAider,
    link: "https://www.jeveuxaider.gouv.fr/",
  },
  {
    title: "Réserve la Gendarmerie nationale",
    description:
      "La réserve opérationnelle de la gendarmerie renforce l'action des unités d’active et les structures de commandement. Les réservistes contribuent directement, à la production de sécurité et à la bonne exécution des lois.",
    picture: reserveGendarmerie,
    link: "https://www.gendarmerie.interieur.gouv.fr/notre-institution/generalites/nos-effectifs/reserve-gendarmerie/devenir-reserviste",
  },
  {
    title: "Réserve des Armées",
    description:
      "Un engagement permettant de contribuer à la sécurité du pays en consacrant une partie de son temps à la défense de la France, notamment en participant à des missions de protection de la population.",
    picture: reserveArmee,
    link: "https://www.reservistes.defense.gouv.fr/",
  },
];

export default function StepWaitingConsent() {
  const young = useSelector((state) => state.Auth.young);
  const [disabled, setDisabled] = React.useState(false);
  const [error, setError] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [notAuthorised, setNotAuthorised] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState({});

  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (young?.parentAllowSNU === "false") {
      setNotAuthorised(true);
    }
  }, [young]);

  const handleClick = async () => {
    setDisabled(true);
    try {
      const { ok, code } = await api.put(`/young/inscription2023/relance`);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setDisabled(false);
        return;
      }
      toastr.success("Succès", "Votre relance a bien été prise en compte.");
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
      setDisabled(false);
    }
  };

  const handleDone = async () => {
    setDisabled(true);
    try {
      const { ok, code, data } = await api.put(`/young/inscription2023/done`);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setDisabled(false);
        return;
      }
      dispatch(setYoung(data));
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
      setDisabled(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  return !notAuthorised ? (
    <>
      {young?.parentAllowSNU === "true" ? (
        <>
          <div className="bg-white p-4 text-[#161616]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <ConsentDone />
                <h1 className="flex-1 text-[22px] font-bold">Bravo, nous allons étudier votre dossier !</h1>
              </div>
              <hr className="my-2 h-px border-0 bg-gray-200" />
              <p className="text-base text-[#161616] ">
                Bonne nouvelle, votre représentant légal a <strong>déjà donné son consentement.</strong>
              </p>
              <p className="mt-2 text-base text-[#161616]">Vous pouvez désormais accéder à votre compte volontaire.</p>
            </div>
          </div>
          <Footer marginBottom="mb-[88px]" />
          <StickyButton text={"Accéder à mon compte volontaire"} onClick={() => handleDone()} />
        </>
      ) : (
        <>
          <div className="bg-white p-4 text-[#161616]">
            {error?.text && <Error {...error} onClose={() => setError({})} />}
            <h1 className="mt-2 text-xl font-bold">Bravo, vous avez terminé votre inscription.</h1>
            <div className="mt-2 text-sm text-[#666666]">
              Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à l’administration pour le valider.
            </div>

            <div className="mt-4 flex flex-col gap-1 border-[1px] border-b-4 border-[#E5E5E5] border-b-[#000091] p-4">
              <div className="text-base font-bold text-[#161616]">En attente du consentement de :</div>
              <div className="text-base text-[#3A3A3A] ">
                {young?.parent1FirstName} {young.parent1LastName}
              </div>
              <div className="text-sm text-[#666666] ">{young?.parent1Email}</div>
              <div className="mt-2 flex justify-between">
                <button
                  className="mt-2 h-10 w-1/2 bg-[#000091] text-base text-white disabled:bg-[#E5E5E5]  disabled:text-[#929292] "
                  disabled={disabled}
                  onClick={() => handleClick()}>
                  Relancer
                </button>
                <img className="translate-y-4" src={Avatar} />
              </div>
            </div>
            <div className="my-4 flex cursor-pointer items-center justify-end gap-2 text-base text-[#000091]" onClick={() => history.push("/inscription2023/confirm")}>
              <EditPen />
              Modifier mes informations
            </div>
            <div className="flex w-full justify-end">
              <a className="w-1/3" href="https://jedonnemonavis.numerique.gouv.fr/Demarches/3504?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f">
                <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" />
              </a>
            </div>
          </div>

          <div className="fixed bottom-0 z-50 w-full">
            <div className="flex flex-row gap-4 bg-white p-4 shadow-ninaInverted">
              <button
                className="flex w-full cursor-pointer items-center justify-center border-[1px] border-[#000091] p-2 text-[#000091] disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:text-[#929292]"
                disabled={loading}
                onClick={() => logout()}>
                Revenir à l&apos;accueil
              </button>
            </div>
          </div>
          <Footer marginBottom="mb-[88px]" />
        </>
      )}
    </>
  ) : (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <div className="flex items-center gap-4">
          <img src={ErrorPic} />
          <div className="text-xl font-bold text-[#161616]">Mauvaise nouvelle...</div>
        </div>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        <div className="text-base text-[#161616]">
          Malheureusement votre représentant légal n&apos;a <strong>pas consenti</strong> à votre participation au SNU.
          <br />
          <br />
          Mais tout n’est pas perdu, il existe d’autres moyens de s’engager ! Découvrez-les maintenant.
        </div>
        <div className="my-4 text-base font-bold">Découvrez d’autres formes d’engagement</div>
        <div className="flex space-x-6 overflow-x-auto">
          {engagementPrograms.map((program, index) => {
            return (
              <div key={index} className="flex w-96">
                <div className="h-min-[700px] w-64 ">
                  <div className="h-[155px] w-full ">
                    <a href={program.link} target="_blank" rel="noreferrer">
                      <img src={program.picture} className="h-full w-full object-cover" />
                    </a>
                  </div>
                  <div className={`min-h-min border border-[#E5E5E5] pl-4 pr-1 pb-2 ${!isOpen[index] && "h-[250px]"}`}>
                    <div className="my-4 min-h-[40px] font-semibold">{program.title}</div>
                    <div className={`mb-4 text-[13px] leading-6 ${!isOpen[index] && "h-[70px] overflow-hidden text-ellipsis"}`}>
                      {" "}
                      <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                        {program.description}
                      </a>
                    </div>
                    <div
                      className="flex justify-between pr-2 text-[13px]"
                      onClick={() => {
                        setIsOpen({ ...isOpen, [index]: !isOpen[index] });
                      }}>
                      <div>{isOpen[index] ? "Lire moins" : "Lire plus"}</div>
                      <img src={arrowRightBlue} className="w-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="my-4 border-[1px] border-[#000091] p-2 text-center text-[#000091]"
          onClick={() => {
            history.push("/public-engagements");
          }}>
          Voir plus de formes d’engagement
        </div>
      </div>
      <div className="fixed bottom-0 z-50 w-full">
        <div className="flex flex-row gap-4 bg-white p-4 shadow-ninaInverted">
          <button
            className="flex w-full cursor-pointer items-center justify-center border-[1px] border-[#000091] bg-[#000091] p-2 text-white disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:text-[#929292]"
            disabled={loading}
            onClick={() => logout()}>
            Revenir à l&apos;accueil
          </button>
        </div>
      </div>
      <Footer marginBottom="mb-[88px]" />
    </>
  );
}
