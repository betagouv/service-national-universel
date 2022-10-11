import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import FranceConnectButton from "../../inscription/components/FranceConnectButton";
import Input from "../../inscription2023/components/Input";
// TODO: mettre le Toggle dans les components génériques
import Toggle from "../../../components/inscription/toggle";
import { COHESION_STAY_LIMIT_DATE, getAge } from "snu-lib";
import RadioButton from "../components/RadioButton";
import Check from "../components/Check";

export default function Consentement({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    confirmAddress: true,
    allowSNU: null,
    rightOlder: false,
    personalData: false,
    healthForm: false,
    vaccination: false,
    internalRules: false,
    allowCovidAutotest: null,
    allowImageRights: null,
  });

  useEffect(() => {
    if (young) {
      setData({
        firstName: young.parent1FirstName ? young.parent1FirstName : "",
        lastName: young.parent1LastName ? young.parent1LastName : "",
        email: young.parent1Email ? young.parent1Email : "",
        phone: young.parent1Phone ? young.parent1Phone : "",
        confirmAddress: true,
        allowSNU: young.parentAllowSNU,
        rightOlder: young.rulesParent1,
        personalData: young.rulesParent1,
        healthForm: young.rulesParent1,
        vaccination: young.rulesParent1,
        internalRules: young.rulesParent1,
        allowCovidAutotest: young.autoTestPCR,
        allowImageRights: young.parent1ImageRights,
      });
    }
  }, [young]);

  if (!young) return <Loader />;

  const isParentFromFranceConnect = young.parent1FromFranceConnect === "true";
  const franceConnectCallbackUrl = "representants-legaux/france-connect-callback?parent=1&token=" + token;

  const formattedAddress =
    young.parent1Address +
    (young.parent1ComplementAddress ? " " + young.parent1ComplementAddress : "") +
    " " +
    young.parent1Zip +
    " " +
    young.parent1City +
    (young.parent1Country ? ", " + young.parent1Country : "");

  const youngFullname = young.firstName + " " + young.lastName;
  const youngAge = getAge(young.birthDate);
  const sessionDate = COHESION_STAY_LIMIT_DATE[young.cohort];

  function onSubmit() {
    console.log("DATA: ", data);
    // history.push(`/representants-legaux/consentement?token=${token}`);
  }
  function onPrevious() {
    history.push(`/representants-legaux/verification?token=${token}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] text-[#161616]">
          <h1 className="text-[24px] leading-[32px] font-bold leading-40 text-[#21213F] mb-2">Apporter votre consentement</h1>

          <div className="text-[14px] leading-[20px] text-[#666666] mb-[32px] mt-2">
            <p>
              En tant que représentant(e) légal(e), utilisez ce bouton pour vous identifier avec FranceConnect et
              <b>vérifier votre identité et vos données personnelles</b> (nom, prénom, adresse email), ou complétez les informations <b>manuellement</b> ci-dessous.
            </p>
          </div>

          <div>
            {isParentFromFranceConnect ? (
              <div className="w-[400px] text-[14px] leading-[20px] text-[#666666] mx-auto mb-[32px]">
                Les information en provenance de FranceConnect du représentant légal n°1 ont bien été enregistrées.
              </div>
            ) : (
              <FranceConnectButton callback={franceConnectCallbackUrl} className="flex-column" />
            )}
          </div>

          <div className="pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
            <div className="flex">
              <Input className="flex-[1_0_0] mr-2" value={data.firstName} label="Prénom" onChange={(e) => setData({ ...data, firstName: e })} error={errors.firstName} />
              <Input className="flex-[1_0_0] ml-2" value={data.lastName} label="Nom" onChange={(e) => setData({ ...data, lastName: e })} error={errors.lastName} />
            </div>
            <Input className="" value={data.email} label="Adresse email" onChange={(e) => setData({ ...data, email: e })} error={errors.email} />
            <Input className="" value={data.phone} label="Votre téléphone" onChange={(e) => setData({ ...data, phone: e })} error={errors.phone} />
          </div>

          <div className="py-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid flex items-center">
            <div className="flex-grow-1">
              <b>Je réside</b> {formattedAddress}
            </div>
            <Toggle onClick={() => setData({ ...data, confirmAddress: !data.confirmAddress })} toggled={data.confirmAddress} />
            {errors.confirmAddress ? <span className="text-red-500 text-sm">{errors.confirmAddress}</span> : null}
          </div>

          <div className="py-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
            <AuthorizeBlock title="Participation au SNU" value={data.allowSNU} onChange={(e) => setData({ ...data, allowSNU: e })}>
              {youngFullname} à participer à la session {sessionDate} du Service National Universel qui comprend la participation à un séjour de cohésion et la réalisation
              d&apos;une mission d&apos;intérêt général.
            </AuthorizeBlock>

            <div className="pt-[32px]">
              <div>
                Je, <b>{data.firstName + " " + data.lastName}</b>
                <Check checked={data.rightOlder} onChange={(e) => setData({ ...data, rightOlder: e })} className="mt-[32px]">
                  Confirme être titulaire de l&apos;autorité parentale/ représentant(e) légal(e) de {youngFullname}
                </Check>
                <Check checked={data.personalData} onChange={(e) => setData({ ...data, personalData: e })} className="mt-[24px]">
                  J&apos;accepte la collecte et le traitement des données personnelles de {youngFullname}
                </Check>
                {youngAge < 15 && (
                  <Check checked={data.healthForm} onChange={(e) => setData({ ...data, healthForm: e })} className="mt-[24px]">
                    M’engage à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires avant son départ en séjour de
                    cohésion. (<a href="https://drive.google.com/drive/u/0/folders/1dMJ8l3HEGQ7GYTXphQ7COJ5Uy_bD2dYe">Télécharger la fiche sanitaire ici</a>)
                  </Check>
                )}
                <Check checked={data.vaccination} onChange={(e) => setData({ ...data, vaccination: e })} className="mt-[24px]">
                  M&apos;engage à ce que {youngFullname} soit à jour de ses vaccinations obligatoires, c&apos;est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les
                  volontaires résidents de Guyane, la fièvre jaune.
                </Check>
                <Check checked={data.internalRules} onChange={(e) => setData({ ...data, internalRules: e })} className="mt-[24px]">
                  Reconnais avoir pris connaissance du <a href="https://drive.google.com/file/d/17T9zkm7gm5hdsazM5YkkOYwkNe1xvpdc/view?usp=sharing">Règlement Intérieur du SNU</a>.
                </Check>
              </div>
            </div>
          </div>
          <div className="pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
            <AuthorizeBlock title="Utilisation d’autotests COVID" value={data.allowCovidAutotest} onChange={(e) => setData({ ...data, allowCovidAutotest: e })}>
              La réalisation d’autotests antigéniques sur prélèvement nasal par l’enfant dont je suis titulaire de l’autorité parentale, et, en cas de résultat positif, la
              communication communication communication de celui-ci au directeur académiques des services académiques, à l’ARS, au chef de centre et aux personnes habilitées par ce
              dernier.
              {/*TODO: mettre le lien */}
              <a href="#" target="_blank">
                Lire plus
              </a>
            </AuthorizeBlock>
            <AuthorizeBlock className="mt-[32px]" title="Droit à l’image" value={data.allowImageRights} onChange={(e) => setData({ ...data, allowImageRights: e })}>
              Le Ministère de l’Education Nationale, de la Jeunesse et des Sports, ses partenaires et les journalistes dûment accrédités par les services communication du ministère
              ministère et/ou des préfectures à enregistrer, reproduire et représenter l’image et/ou la voix du volontaire représenté en partie ou en intégralité, ensemble ou
              séparément, sur leurs publications respectives.
              {/*TODO: mettre le lien */}
              <a href="#" target="_blank">
                Lire plus
              </a>
            </AuthorizeBlock>
          </div>

          <div className="flex justify-content-end pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
            <button className="flex items-center justify-center px-3 py-2 cursor-pointer border-[1px] border-solid border-[#000091] text-[#000091] mr-2" onClick={onPrevious}>
              Précédent
            </button>
            <button className="flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white" onClick={onSubmit}>
              Je valide mon consentement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function AuthorizeBlock({ title, value, onChange, children, className }) {
  const options = [
    { value: "true", label: "J'autorise" },
    { value: "false", label: "Je n'autorise pas" },
  ];

  return (
    <div className={className}>
      <RadioButton label={title} options={options} onChange={onChange} value={value} />
      <div className="">{children}</div>
    </div>
  );
}
