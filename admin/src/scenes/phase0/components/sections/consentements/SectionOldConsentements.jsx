import React from "react";

import Section from "../../Section";

export default function SectionOldConsentements({ young }) {
  return (
    <Section title="Consentements" collapsable>
      <div className="flex-[1_0_50%] pr-[56px]">
        <div className="text-[16px] font-medium leading-[24px] text-[#242526]">
          Consentements validés par {young.firstName} {young.lastName}
        </div>
        <div>
          <ul className="ml-[24px] list-outside">
            <li className="mt-[16px]">A lu et accepte les Conditions générales d&apos;utilisation de la plateforme du Service national universel&nbsp;;</li>
            <li className="mt-[16px]">A pris connaissance des modalités de traitement de mes données personnelles&nbsp;;</li>
            <li className="mt-[16px]">
              Est volontaire, sous le contrôle des représentants légaux, pour effectuer la session {young.cohort} du Service National Universel qui comprend la participation au
              séjour de cohésion puis la réalisation d&apos;une mission d&apos;intérêt général&nbsp;;
            </li>
            <li className="mt-[16px]">Certifie l&apos;exactitude des renseignements fournis&nbsp;;</li>
            <li className="mt-[16px]">
              Si en terminale, a bien pris connaissance que si je suis convoqué(e) pour les épreuves du second groupe du baccalauréat entre le 6 et le 8 juillet 2022, je ne pourrai
              pas participer au séjour de cohésion entre le 3 et le 15 juillet 2022(il n’y aura ni dérogation sur la date d’arrivée au séjour de cohésion ni report des épreuves).
            </li>
          </ul>
        </div>
      </div>
      <div className="my-[73px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
      <div className="flex-[1_0_50%] pl-[56px] pb-[32px]">
        <div className="text-[16px] font-medium leading-[24px] text-[#242526]">Consentements validés par ses représentants légaux</div>
        <div>
          <ul className="ml-[24px] list-outside">
            <li className="mt-[16px]">Confirmation d&apos;être titulaire de l&apos;autorité parentale/le représentant légal du volontaire&nbsp;;</li>
            <li className="mt-[16px]">
              Autorisation du volontaire à participer à la session {young.cohort} du Service National Universel qui comprend la participation au séjour de cohésion puis la
              réalisation d&apos;une mission d&apos;intérêt général&nbsp;;
            </li>
            <li className="mt-[16px]">Engagement à renseigner le consentement relatif aux droits à l&apos;image avant le début du séjour de cohésion&nbsp;;</li>
            <li className="mt-[16px]">Engagement à renseigner l&apos;utilisation d&apos;autotest COVID avant le début du séjour de cohésion&nbsp;;</li>
            <li className="mt-[16px]">
              Engagement à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires à son arrivée au centre de séjour de
              cohésion&nbsp;;
            </li>
            <li className="mt-[16px]">
              Engagement à ce que le volontaire soit à jour de ses vaccinations obligatoires, c&apos;est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les
              volontaires résidents de Guyane, la fièvre jaune.
            </li>
          </ul>
        </div>
        {young.parent2Status && <div className="mt-[24px] border-t-[1px] border-t-[#E5E7EB] pt-[24px]"></div>}
      </div>
    </Section>
  );
}
