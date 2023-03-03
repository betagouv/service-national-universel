import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { translate } from "snu-lib";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import ConsentDone from "../../../assets/icons/ConsentDone";
import jeVauxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";
import Error from "../../../components/error";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import Avatar from "../../inscription2023/assets/avatar.png";
import ErrorPic from "../../inscription2023/assets/error.png";

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
      const { ok, code, data } = await api.put(`/young/reinscription/done`);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setDisabled(false);
        return;
      }
      dispatch(setYoung(data));
      history.push("/home");
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
    young?.parentAllowSNU === "true" ? (
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] text-[#161616] relative">
          <h2 className="font-bold text-[#161616] text-[32px] leading-[40px] pb-[32px] border-b-solid border-b-[1px] border-b-[#E5E5E5] m-[0] mb-[32px]">
            {young.firstName}, bienvenue au SNU !
          </h2>
          <p>
            Bonne nouvelle, <strong>votre inscription a déjà été validée</strong>.
          </p>
          <hr className="my-4 h-px bg-gray-200 border-0" />
          <div className="flex flex-col items-end w-full mt-4">
            <div className="flex justify-end space-x-4">
              <button
                className="flex items-center justify-center py-2 px-4 hover:!text-[#000091] border-[1px] hover:border-[#000091] hover:bg-white cursor-pointer bg-[#000091] text-white disabled:bg-[#E5E5E5] disabled:!text-[#929292] disabled:border-[#E5E5E5]"
                onClick={() => handleDone()}>
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
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
          <div className="bg-white p-4 text-[#161616]">
            {error?.text && <Error {...error} onClose={() => setError({})} />}
            <h1 className="text-[32px] font-bold mt-2">Bravo, vous avez terminé votre inscription.</h1>
            <div className="text-[#666666] text-sm mt-4">Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera validé.</div>

            <div className="flex flex-col mt-4 border-[1px] border-b-4 border-b-[#000091] border-[#E5E5E5] py-[32px] px-[48px] gap-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-[#161616] text-lg font-bold">En attente du consentement de :</div>
                  <div className="text-[#3A3A3A] text-lg ">
                    {young?.parent1FirstName} {young.parent1LastName}
                  </div>
                  <div className="text-[#666666] text-[15px] ">{young?.parent1Email}</div>
                </div>
                <img className="w-[80px] h-[80px]" src={Avatar} />
              </div>
              <div className="flex justify-between mt-2">
                <button
                  className="mt-2 h-10 text-base px-8 border-[1px] hover:border-[#000091] hover:!text-[#000091] hover:bg-white bg-[#000091] text-white disabled:border-[#E5E5E5] disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
                  disabled={disabled}
                  onClick={() => handleClick()}>
                  Relancer
                </button>
              </div>
            </div>
            <hr className="my-4 h-px bg-gray-200 border-0" />
            <div className="flex flex-col items-end w-full">
              <div className="flex justify-end space-x-4">
                <button
                  className="flex items-center justify-center py-2 px-4 text-[#000091] border-[1px] border-[#000091] cursor-pointer hover:bg-[#000091] hover:text-white disabled:bg-[#E5E5E5] disabled:text-[#929292] disabled:border-[#E5E5E5]"
                  disabled={loading}
                  onClick={() => logout()}>
                  Revenir à l&apos;accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  ) : (
    <div className="bg-[#f9f6f2] flex justify-center py-10">
      <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
        <div className="bg-white p-4 text-[#161616]">
          <div className="flex gap-4 items-center justify-between">
            <div className="text-[#161616] text-[32px] font-bold">Mauvaise nouvelle...</div>
            <img src={ErrorPic} />
          </div>
          <hr className="my-4 h-px bg-gray-200 border-0" />
          <div className="text-lg text-[#161616]">
            Malheureusement votre représentant légal n&apos;a <strong>pas consenti</strong> à votre participation au SNU.
          </div>
          <div className="text-lg text-[#161616] mt-2">Mais tout n’est pas perdu, il existe d’autres moyens de s’engager ! Découvrez-les maintenant.</div>
          <hr className="my-4 h-px bg-gray-200 border-0" />
          <div className="text-lg font-bold my-4">Découvrez d’autres formes d’engagement</div>
          <div className="overflow-x-auto flex flex-wrap justify-between">
            {engagementPrograms.map((program, index) => {
              return (
                <div key={index} className="flex basis-[48%] mt-4 ">
                  <div className="w-full h-min-[700px] ">
                    <div className="w-full h-[155px] ">
                      <a href={program.link} target="_blank" rel="noreferrer">
                        <img src={program.picture} className="object-cover w-full h-full" />
                      </a>
                    </div>
                    <div className={`min-h-min pl-4 pr-1 pb-2 border border-[#E5E5E5] ${!isOpen[index] && "h-[250px]"}`}>
                      <div className="font-semibold my-4 min-h-[40px]">{program.title}</div>
                      <div className={`text-[13px] leading-6 mb-4 ${!isOpen[index] && "h-[70px] text-ellipsis overflow-hidden"}`}>
                        <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                          {program.description}
                        </a>
                      </div>
                      <div
                        className="text-[13px] flex justify-between pr-2 cursor-pointer"
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
          <div className="flex justify-center my-8">
            <div
              className="text-[#000091] text-center border-[1px] border-[#000091] w-[50%]  p-2 cursor-pointer"
              onClick={() => {
                history.push("/public-engagements");
              }}>
              Voir plus de formes d’engagement
            </div>
          </div>

          <hr className="my-5 h-px bg-gray-200 border-0" />
          <div className="flex flex-col items-end w-full">
            <div className="flex justify-end space-x-4">
              <button
                className="flex items-center justify-center py-2 px-4 hover:!text-[#000091] border-[1px] hover:border-[#000091] hover:bg-white cursor-pointer bg-[#000091] text-white disabled:bg-[#E5E5E5] disabled:text-[#929292] disabled:border-[#E5E5E5]"
                disabled={loading}
                onClick={() => logout()}>
                Revenir à l&apos;accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
