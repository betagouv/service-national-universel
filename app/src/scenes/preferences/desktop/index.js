import React from "react";
import { BigTitle, Box, PlainButton, Section, Title, PREF_DOMAINS, MiniTitle, PREF_FORMATS, translateEnumToOptions, PREF_PERIOD_ICONS } from "../commons";
import DomainSelector from "./components/DomainSelector";
import ToggleGroup from "../components/ToggleGroup";
import { PERIOD, TRANSPORT, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION, translate } from "snu-lib";
import MultiGroup from "../components/MultiGroup";
import SimpleSelect from "../components/SimpleSelect";
import SimpleInput from "../components/SimpleInput";
import SimpleSwitch from "../components/SimpleSwitch";
import RankingPeriod from "../rankingPeriod";
import SimpleCheckbox from "../components/SimpleCheckbox";

export default function DestktopIndex({ young, onSave, saving, onToggleDomain, hasDomainSelected, onChange }) {
  return (
    <div className="m-8">
      <Box>
        <div className="flex items-start">
          <div className="mr-4">
            <BigTitle>Mes préférences de missions</BigTitle>
            <div>
              En vue de la mission d&apos;intérêt général de la Phase 2, renseignez ci-dessous vos préférences. Ces choix permettront à l&apos;administration de vous proposer des
              missions en cohérence avec vos motivations.
            </div>
          </div>
          <PlainButton onClick={onSave} spinner={saving}>
            Enregistrer
          </PlainButton>
        </div>
        <Section>
          <Title noBorder>Sélectionnez les 3 thématiques qui vous intéressent le plus</Title>
          <div className="grid grid-cols-2 gap-4 mx-8">
            {PREF_DOMAINS.map((domain) => (
              <DomainSelector key={domain.type} title={domain.title} icon={domain.icon} selected={hasDomainSelected(domain.type)} onClick={() => onToggleDomain(domain.type)}>
                {domain.text}
              </DomainSelector>
            ))}
          </div>
        </Section>
        <Section>
          <Title>Quel est votre projet professionnel ?</Title>
          <div className="grid grid-cols-2 gap-4 mx-8">
            <SimpleSelect
              title="Projet professionnel"
              value={young.professionnalProject}
              options={translateEnumToOptions(PROFESSIONNAL_PROJECT)}
              transformer={translate}
              onChange={(val) => onChange("professionnalProject", val)}
            />
            {young.professionnalProject === PROFESSIONNAL_PROJECT.UNIFORM ? (
              <SimpleSelect
                title="Précisez"
                value={young.professionnalProjectPrecision}
                options={translateEnumToOptions(PROFESSIONNAL_PROJECT_PRECISION)}
                transformer={translate}
                placeholder="Projet professionnel"
                onChange={(val) => onChange("professionnalProjectPrecision", val)}
              />
            ) : young.professionnalProject === PROFESSIONNAL_PROJECT.OTHER ? (
              <SimpleInput
                title="Précisez"
                value={young.professionnalProjectPrecision}
                placeholder="précisez votre projet"
                onChange={(val) => onChange("professionnalPrecision", val)}
              />
            ) : (
              <div />
            )}
            <SimpleSwitch value={young.desiredLocationToggle} onChange={(val) => onChange("desiredLocationToggle", val)}>
              Avez-vous déjà une idée de là où vous voudriez réaliser votre mission d&apos;intérêt général ?
            </SimpleSwitch>
            <SimpleSwitch value={young.engaged} onChange={(val) => onChange("engaged", val)}>
              Bénévole en parallèle
            </SimpleSwitch>
            {young.desiredLocationToggle ? (
              <SimpleInput
                title="Endroit où je souhaite effectuer ma mission"
                value={young.desiredLocation}
                placeholder="précisez l'endroit"
                onChange={(val) => onChange("desiredLocation", val)}
              />
            ) : (
              <div />
            )}
            {young.engaged ? (
              <SimpleInput
                title="Description de l’activité"
                value={young.engagedDescription}
                placeholder="précisez votre activité bénévole"
                onChange={(val) => onChange("engagedDescription", val)}
              />
            ) : (
              <div />
            )}
          </div>
        </Section>
        <Section>
          <Title>Quelle période privilégiez-vous pour réaliser la mission d&apos;intérêt général ?</Title>
          <div className="mx-8">
            <MiniTitle>Format préféré</MiniTitle>
            <ToggleGroup
              className="mb-8 text-center"
              value={young.missionFormat}
              onChange={(val) => onChange("missionFormat", val)}
              options={translateEnumToOptions(PREF_FORMATS)}
            />
            <MiniTitle>Période de réalisation de la mission</MiniTitle>
            <ToggleGroup
              className="mb-8 text-center"
              value={young.period}
              onChange={(val) => onChange("period", val)}
              options={translateEnumToOptions(PERIOD, PREF_PERIOD_ICONS)}
            />
            {young.period && (
              <div className="flex justify-center">
                <RankingPeriod handleChange={(e) => onChange("periodRanking", e.target.value)} period={young.period} values={young} name="periodRanking" />
              </div>
            )}
          </div>
        </Section>
        <Section>
          <Title>Quelle est votre mobilité géographique ?</Title>
          <div className="mx-8">
            <MiniTitle>Moyen(s) de transport privilégié(s)</MiniTitle>
            <MultiGroup
              className="mb-8 text-center"
              value={young.mobilityTransport}
              onChange={(val) => onChange("mobilityTransport", val)}
              options={translateEnumToOptions(TRANSPORT)}
            />
            {young.mobilityTransport && young.mobilityTransport.includes(TRANSPORT.OTHER) && (
              <div className="flex justify-center mb-8">
                <SimpleInput
                  className="w-[50%]"
                  title="Précisez"
                  placeholder="Renseignez l'autre moyen de transport"
                  value={young.mobilityTransportOther}
                  onChange={(val) => onChange("mobilityTransportOther", val)}
                />
              </div>
            )}
            <MiniTitle>Périmètre de recherche</MiniTitle>
            <div className="grid grid-cols-3 gap-4">
              <SimpleCheckbox value={young.mobilityNearHome} title="Autour de l’adresse principale" detail={young.city} onChange={(val) => onChange("mobilityNearHome", val)} />
              {young.schooled && young.schoolCity && (
                <SimpleCheckbox
                  value={young.mobilityNearSchool}
                  title="Autour de l’établissement"
                  detail={young.schoolCity}
                  onChange={(val) => onChange("mobilityNearSchool", val)}
                />
              )}
              <SimpleCheckbox
                value={young.mobilityNearRelative}
                title="Autour de l’adresse d’un proche"
                detail={young.mobilityNearRelativeCity ? young.mobilityNearRelativeCity : "Renseigner une adresse"}
                onChange={(val) => onChange("mobilityNearRelative", val)}
              />
            </div>
            {young.mobilityNearRelative && (
              <div className="flex justify-center mt-8">
                <div className="w-[50%] border border-gray-200 rounded-md p-8">
                  <MiniTitle>Adresse du proche</MiniTitle>
                  <div className="grid grid-rows-3 gap-4">
                    <SimpleInput
                      className=""
                      title="Nom"
                      value={young.mobilityNearRelativeName}
                      placeholder="Nom du proche"
                      onChange={(val) => onChange("mobilityNearRelativeName", val)}
                    />
                    <SimpleInput
                      className=""
                      title="Adresse"
                      value={young.mobilityNearRelativeAddress}
                      placeholder="Adresse du proche"
                      onChange={(val) => onChange("mobilityNearRelativeAddress", val)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <SimpleInput
                        className=""
                        title="Code postal"
                        value={young.mobilityNearRelativeZip}
                        placeholder="Saisissez un code postal"
                        onChange={(val) => onChange("mobilityNearRelativeZip", val)}
                      />
                      <SimpleInput
                        className=""
                        title="Ville"
                        value={young.mobilityNearRelativeCity}
                        placeholder="Ville du proche"
                        onChange={(val) => onChange("mobilityNearRelativeCity", val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>
        <div className="flex justify-end mt-10">
          <PlainButton onClick={onSave} spinner={saving}>
            Enregistrer
          </PlainButton>
        </div>
      </Box>
    </div>
  );
}
