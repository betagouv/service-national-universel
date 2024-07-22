import React from "react";
import { BigTitle, Box, PlainButton, Section, Title, PREF_DOMAINS, MiniTitle, PREF_FORMATS, translateEnumToOptions, PREF_PERIOD_ICONS } from "./commons";
import DomainSelector from "./components/DomainSelector";
import ToggleGroup from "./components/ToggleGroup";
import { PERIOD, TRANSPORT, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION, translate } from "snu-lib";
import MultiGroup from "./components/MultiGroup";
import SimpleSelect from "./components/SimpleSelect";
import SimpleInput from "./components/SimpleInput";
import SimpleSwitch from "./components/SimpleSwitch";
import RankingPeriod from "./components/RankingPeriod";

export default function View({ young, onSave, saving, onToggleDomain, hasDomainSelected, onChange, mobile, errors }) {
  return (
    <div className="pb-24">
      {Object.values(errors).length ? <div className="text-center mt-6 text-sm text-[#F71701]">Il y a des erreurs ou des données manquantes dans le formulaire.</div> : null}
      <Section>
        <Title noBorder>Sélectionnez les 3 thématiques qui vous intéressent le plus</Title>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-2 md:gap-4">
          {PREF_DOMAINS.map((domain) => (
            <DomainSelector
              className="mb-2 md:mb-0"
              key={domain.type}
              title={domain.title}
              icon={domain.icon}
              selected={hasDomainSelected(domain.type)}
              onClick={() => onToggleDomain(domain.type)}>
              {domain.text}
            </DomainSelector>
          ))}
        </div>
        {errors.domains && <div className="mt-2 text-center text-sm text-[#F71701]">{errors.domains}</div>}
      </Section>
      <Section>
        <Title>Quel est votre projet professionnel ?</Title>
        <div className="md:mx-8 md:grid md:grid-cols-2 md:gap-4">
          <SimpleSelect
            className="mb-4 md:mb-0"
            title="Projet professionnel"
            value={young.professionnalProject}
            options={translateEnumToOptions(PROFESSIONNAL_PROJECT)}
            transformer={translate}
            onChange={(val) => onChange("professionnalProject", val)}
            error={errors.professionnalProject}
          />
          {young.professionnalProject === PROFESSIONNAL_PROJECT.UNIFORM ? (
            <SimpleSelect
              className="mb-4 md:mb-0"
              title="Précisez"
              value={young.professionnalProjectPrecision}
              options={translateEnumToOptions(PROFESSIONNAL_PROJECT_PRECISION)}
              transformer={translate}
              placeholder="Projet professionnel"
              onChange={(val) => onChange("professionnalProjectPrecision", val)}
              error={errors.professionnalProjectPrecision}
            />
          ) : young.professionnalProject === PROFESSIONNAL_PROJECT.OTHER ? (
            <SimpleInput
              className="mb-4 md:mb-0"
              title="Précisez"
              value={young.professionnalProjectPrecision}
              placeholder="précisez votre projet"
              onChange={(val) => onChange("professionnalProjectPrecision", val)}
              error={errors.professionnalProjectPrecision}
            />
          ) : (
            <div className="hidden md:block" />
          )}
          <div className="md:flex">
            <SimpleSwitch className="my-8 md:my-0" value={young.desiredLocationToggle} onChange={(val) => onChange("desiredLocationToggle", val)}>
              Avez-vous déjà une idée de là où vous voudriez réaliser votre mission d&apos;intérêt général ?
            </SimpleSwitch>
            {young.desiredLocationToggle && (
              <SimpleInput
                className="md:hidden"
                title="Endroit où je souhaite effectuer ma mission"
                value={young.desiredLocation}
                placeholder="précisez l'endroit"
                onChange={(val) => onChange("desiredLocation", val)}
                error={errors.desiredLocation}
              />
            )}
          </div>
          <div className="md:flex">
            <SimpleSwitch className="my-8 md:my-0" value={young.engaged} onChange={(val) => onChange("engaged", val)}>
              Bénévole en parallèle
            </SimpleSwitch>
            {young.engaged && (
              <SimpleInput
                className="md:hidden"
                title="Description de l’activité"
                value={young.engagedDescription}
                placeholder="précisez votre activité bénévole"
                onChange={(val) => onChange("engagedDescription", val)}
                error={errors.engaged}
              />
            )}
          </div>
          {young.desiredLocationToggle ? (
            <SimpleInput
              className="hidden md:flex"
              title="Endroit où je souhaite effectuer ma mission"
              value={young.desiredLocation}
              placeholder="précisez l'endroit"
              onChange={(val) => onChange("desiredLocation", val)}
              error={errors.desiredLocation}
            />
          ) : (
            <div className="hidden md:block" />
          )}
          {young.engaged ? (
            <SimpleInput
              className="hidden md:flex"
              title="Description de l’activité"
              value={young.engagedDescription}
              placeholder="précisez votre activité bénévole"
              onChange={(val) => onChange("engagedDescription", val)}
              error={errors.engagedDescription}
            />
          ) : (
            <div className="hidden md:block" />
          )}
        </div>
      </Section>
      <Section>
        <Title>Quelle période privilégiez-vous pour réaliser la mission d&apos;intérêt général ?</Title>
        <div className="md:mx-8">
          <div className="md:rounded-0 mb-8 rounded-lg border-[1px] border-gray-200 py-6 px-3 md:mb-0 md:border-none md:p-0">
            <MiniTitle>Format préféré</MiniTitle>
            {errors.missionFormat && <div className="m-2 text-center text-sm text-[#F71701]">{errors.missionFormat}</div>}
            <ToggleGroup
              className="md:mb-8 md:text-center"
              value={young.missionFormat}
              onChange={(val) => onChange("missionFormat", val)}
              options={translateEnumToOptions(PREF_FORMATS)}
              mode={mobile ? "multi" : "toggle"}
            />
          </div>
          <div className="md:rounded-0 mb-8 rounded-lg border-[1px] border-gray-200 py-6 px-3 md:mb-0 md:border-none md:p-0">
            <MiniTitle>Période de réalisation de la mission</MiniTitle>
            {errors.period && <div className="m-2 text-center text-sm text-[#F71701]">{errors.period}</div>}
            <ToggleGroup
              className="md:mb-8 md:text-center"
              value={young.period}
              onChange={(val) => onChange("period", val)}
              options={translateEnumToOptions(PERIOD, PREF_PERIOD_ICONS)}
              mode={mobile ? "multi" : "toggle"}
            />
            {young.period && (
              <div className="mt-4 flex md:mt-0 md:justify-center">
                <RankingPeriod handleChange={(e) => onChange("periodRanking", e.target.value)} period={young.period} values={young} name="periodRanking" />
              </div>
            )}
          </div>
        </div>
      </Section>
      <Section>
        <Title>Quelle est votre mobilité géographique ?</Title>
        <div className="md:mx-8">
          <div className="md:rounded-0 mb-8 rounded-lg border-[1px] border-gray-200 py-6 px-3 md:mb-0 md:border-none md:p-0">
            <MiniTitle>Moyen(s) de transport privilégié(s)</MiniTitle>
            <MultiGroup
              className="mb-8 text-center"
              value={young.mobilityTransport}
              onChange={(val) => onChange("mobilityTransport", val)}
              options={translateEnumToOptions(TRANSPORT)}
            />
            {young.mobilityTransport && young.mobilityTransport.includes(TRANSPORT.OTHER) && (
              <div className="flex justify-center md:mb-8">
                <SimpleInput
                  className="w-[100%] md:w-[50%]"
                  title="Précisez"
                  placeholder="Renseignez l'autre moyen de transport"
                  value={young.mobilityTransportOther}
                  onChange={(val) => onChange("mobilityTransportOther", val)}
                  error={errors.mobilityTransportOther}
                />
              </div>
            )}
          </div>
        </div>
      </Section>
      {Object.values(errors).length ? <div className="text-center mt-6 text-sm text-[#F71701]">Il y a des erreurs ou des données manquantes dans le formulaire.</div> : null}
      <div className="mt-6 flex justify-center">
        <PlainButton onClick={onSave} spinner={saving}>
          Enregistrer
        </PlainButton>
      </div>
    </div>
  );
}
