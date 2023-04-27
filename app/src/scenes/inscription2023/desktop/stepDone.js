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
import EditPen from "../../../assets/icons/EditPen";
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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
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
      //history.push("/");
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
    history.push("/");
  };

  return !notAuthorised ? (
    <>
      {young?.parentAllowSNU === "true" ? (
        <div className="flex justify-center bg-[#f9f6f2] py-10">
          <div className="relative mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
            <h2 className="border-b-solid m-[0] mb-[32px] border-b-[1px] border-b-[#E5E5E5] pb-[32px] text-[32px] font-bold leading-[40px] text-[#161616]">
              Bravo, nous allons étudier votre dossier !
            </h2>
            <p>
              Bonne nouvelle, votre représentant légal a <strong>donné son consentement</strong> à votre participation au SNU.{" "}
            </p>
            <p className="mt-[1em]">Vous pouvez désormais accéder à votre compte volontaire.</p>
            <hr className="my-4 h-px border-0 bg-gray-200" />
            <div className="mt-4 flex w-full flex-col items-end">
              <div className="flex justify-end space-x-4">
                <button
                  className="flex cursor-pointer items-center justify-center border-[1px] bg-[#000091] py-2 px-4 text-white hover:border-[#000091] hover:bg-white hover:!text-[#000091] disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
                  onClick={() => handleDone()}
                  disabled={disabled}>
                  Accéder à mon compte volontaire
                </button>
              </div>
            </div>

            <div className="absolute top-[30px] right-[30px]">
              <ConsentDone />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center bg-[#f9f6f2] py-10">
          <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px]">
            <div className="bg-white p-4 text-[#161616]">
              {error?.text && <Error {...error} onClose={() => setError({})} />}
              <h1 className="mt-2 text-[32px] font-bold">Bravo, vous avez terminé votre inscription.</h1>
              <div className="mt-4 text-sm text-[#666666]">
                Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à l’administration pour le valider.
              </div>

              <div className="mt-4 flex flex-col gap-1 border-[1px] border-b-4 border-[#E5E5E5] border-b-[#000091] py-[32px] px-[48px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="text-lg font-bold text-[#161616]">En attente du consentement de :</div>
                    <div className="text-lg text-[#3A3A3A] ">
                      {young?.parent1FirstName} {young.parent1LastName}
                    </div>
                    <div className="text-[15px] text-[#666666] ">{young?.parent1Email}</div>
                  </div>
                  <img className="h-[80px] w-[80px]" src={Avatar} />
                </div>
                <div className="mt-2 flex justify-between">
                  <button
                    className="mt-2 h-10 border-[1px] bg-[#000091] px-8 text-base text-white hover:border-[#000091] hover:bg-white hover:!text-[#000091] disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
                    disabled={disabled}
                    onClick={() => handleClick()}>
                    Relancer
                  </button>
                </div>
              </div>
              <div className="mt-4 flex cursor-pointer items-center justify-end gap-2 text-base text-[#000091]" onClick={() => history.push("/inscription2023/confirm")}>
                <EditPen />
                Modifier mes informations
              </div>
              <hr className="my-4 h-px border-0 bg-gray-200" />
              <div className="flex w-full flex-row items-center justify-between">
                <div className="h-[70px]">
                  <a
                    className="relative top-[10px]"
                    href="https://jedonnemonavis.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f">
                    <img className="max-h-full max-w-full" src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" />
                  </a>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    className="flex cursor-pointer items-center justify-center border-[1px] border-[#000091] py-2 px-4 text-[#000091] hover:bg-[#000091] hover:text-white disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:text-[#929292]"
                    disabled={loading}
                    onClick={() => logout()}>
                    Revenir à l&apos;accueil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <>
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px]">
          <div className="bg-white p-4 text-[#161616]">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[32px] font-bold text-[#161616]">Mauvaise nouvelle...</div>
              <img src={ErrorPic} />
            </div>
            <hr className="my-4 h-px border-0 bg-gray-200" />
            <div className="text-lg text-[#161616]">
              Malheureusement votre représentant légal n&apos;a <strong>pas consenti</strong> à votre participation au SNU.
            </div>
            <div className="mt-2 text-lg text-[#161616]">Mais tout n’est pas perdu, il existe d’autres moyens de s’engager ! Découvrez-les maintenant.</div>
            <hr className="my-4 h-px border-0 bg-gray-200" />
            <div className="my-4 text-lg font-bold">Découvrez d’autres formes d’engagement</div>
            <div className="flex flex-wrap justify-between overflow-x-auto">
              {engagementPrograms.map((program, index) => {
                return (
                  <div key={index} className="mt-4 flex basis-[48%] ">
                    <div className="h-min-[700px] w-full ">
                      <div className="h-[155px] w-full ">
                        <a href={program.link} target="_blank" rel="noreferrer">
                          <img src={program.picture} className="h-full w-full object-cover" />
                        </a>
                      </div>
                      <div className={`min-h-min border border-[#E5E5E5] pl-4 pr-1 pb-2 ${!isOpen[index] && "h-[250px]"}`}>
                        <div className="my-4 min-h-[40px] font-semibold">{program.title}</div>
                        <div className={`mb-4 text-[13px] leading-6 ${!isOpen[index] && "h-[70px] overflow-hidden text-ellipsis"}`}>
                          <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                            {program.description}
                          </a>
                        </div>
                        <div
                          className="flex cursor-pointer justify-between pr-2 text-[13px]"
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
            <div className="my-8 flex justify-center">
              <div
                className="w-[50%] cursor-pointer border-[1px] border-[#000091] p-2  text-center text-[#000091]"
                onClick={() => {
                  history.push("/public-engagements");
                }}>
                Voir plus de formes d’engagement
              </div>
            </div>

            <hr className="my-5 h-px border-0 bg-gray-200" />
            <div className="flex w-full flex-col items-end">
              <div className="flex justify-end space-x-4">
                <button
                  className="flex cursor-pointer items-center justify-center border-[1px] bg-[#000091] py-2 px-4 text-white hover:border-[#000091] hover:bg-white hover:!text-[#000091] disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:text-[#929292]"
                  disabled={loading}
                  onClick={() => logout()}>
                  Revenir à l&apos;accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
