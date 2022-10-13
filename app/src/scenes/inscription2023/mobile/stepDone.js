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
  const [notAuthorised, setNotAuthorised] = React.useState(true);
  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (young?.parentAllowSNU) {
      if (young?.parentAllowSNU === "true") {
        history.push("/");
      } else if (young?.parentAllowSNU === "false") {
        setNotAuthorised(true);
      }
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

  const logout = async () => {
    setLoading(true);
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    history.push("/");
  };

  return !notAuthorised ? (
    <>
      <div className="bg-white p-4 text-[#161616]">
        {error?.text && <Error {...error} onClose={() => setError({})} />}
        <h1 className="text-xl font-bold mt-2">Bravo, vous avez terminé votre inscription.</h1>
        <div className="text-[#666666] text-sm mt-2">
          Dès lors que votre Représentant Légal aura consenti à votre participation au SNU, votre dossier sera envoyé à l’administration pour le valider.
        </div>

        <div className="flex flex-col mt-4 border-[1px] border-b-4 border-b-[#000091] border-[#E5E5E5] p-4 gap-1">
          <div className="text-[#161616] text-base font-bold">En attente du consentement de :</div>
          <div className="text-[#3A3A3A] text-base ">
            {young?.firstName} {young.lastName}
          </div>
          <div className="text-[#666666] text-sm ">{young?.email}</div>
          <div className="flex justify-between mt-2">
            <button className="mt-2 h-10 text-base w-1/2 disabled:bg-[#E5E5E5] disabled:text-[#929292] bg-[#000091]  text-white " disabled={disabled} onClick={() => handleClick()}>
              Relancer
            </button>
            <img className="translate-y-4" src={Avatar} />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 w-full z-50">
        <div className="flex flex-row shadow-ninaInverted p-4 bg-white gap-4">
          <button
            className="flex items-center justify-center p-2 w-full cursor-pointer border-[1px] border-[#000091] text-[#000091] disabled:bg-[#E5E5E5] disabled:text-[#929292] disabled:border-[#E5E5E5]"
            disabled={loading}
            onClick={() => logout()}>
            Revenir à l&apos;accueil
          </button>
        </div>
      </div>
      <Footer marginBottom="mb-[88px]" />
    </>
  ) : (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <div className="flex gap-4 items-center">
          <img src={ErrorPic} />
          <div className="text-[#161616] text-xl font-bold">Mauvaise nouvelle...</div>
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="text-base text-[#161616]">
          Malheureusement votre représentant légal n&apos;a <strong>pas consenti</strong> à votre participation au SNU.
          <br />
          <br />
          Mais tout n’est pas perdu, il existe d’autres moyens de s’engager ! Découvrez-les maintenant.
        </div>
        <div className="text-base font-bold my-4">Découvrez d’autres formes d’engagement</div>
        <div className="overflow-x-auto flex space-x-6">
          {engagementPrograms.map((program, index) => {
            const [isOpen, setIsOpen] = React.useState(false);

            return (
              <div key={index} className="flex w-96">
                <div className="w-64 h-min-[700px] ">
                  <div className="w-full h-[155px] ">
                    <a href={program.link} target="_blank" rel="noreferrer">
                      <img src={program.picture} className="object-cover w-full h-full" />
                    </a>
                  </div>
                  <div className={`min-h-min pl-4 pr-1 pb-2 border border-[#E5E5E5] ${!isOpen && "h-[250px]"}`}>
                    <div className="font-semibold my-4 min-h-[40px]">{program.title}</div>
                    <div className={`text-[13px] leading-6 mb-4 ${!isOpen && "h-[70px] text-ellipsis overflow-hidden"}`}>
                      {" "}
                      <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                        {program.description}
                      </a>
                    </div>
                    <div
                      className="text-[13px] flex justify-between pr-2"
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}>
                      {" "}
                      <div>{isOpen ? "Lire moins" : "Lire plus"}</div>
                      <img src={arrowRightBlue} className="w-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-0 w-full z-50">
        <div className="flex flex-row shadow-ninaInverted p-4 bg-white gap-4">
          <button
            className="flex items-center justify-center p-2 w-full cursor-pointer border-[1px] border-[#000091] bg-[#000091] text-white disabled:bg-[#E5E5E5] disabled:text-[#929292] disabled:border-[#E5E5E5]"
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
