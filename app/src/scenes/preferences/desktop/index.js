import React from "react";
import { BigTitle, Box, PlainButton, Section, Title, PREF_DOMAINS, MiniTitle, PREF_FORMATS, translateEnumToOptions, PREF_PERIOD_ICONS } from "../commons";
import DomainSelector from "./components/DomainSelector";
import ToggleGroup from "../components/ToggleGroup";
import { PERIOD, TRANSPORT, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION, translate } from "snu-lib";
import MultiGroup from "../components/MultiGroup";
import SimpleSelect from "../components/SimpleSelect";
import SimpleInput from "../components/SimpleInput";

export default function DestktopIndex({
  young,
  onSave,
  onToggleDomain,
  hasDomainSelected,
  changeMissionFormat,
  changePeriod,
  changeMobilityTransport,
  changeProfessionalProject,
  changeProfessionalProjectPrecision,
}) {
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
          <PlainButton onClick={onSave}>Enregistrer</PlainButton>
        </div>
        <Section>
          <Title>Sélectionnez les 3 thématiques qui vous intéressent le plus</Title>
          <div className="grid grid-cols-2 gap-4">
            {PREF_DOMAINS.map((domain) => (
              <DomainSelector key={domain.type} title={domain.title} icon={domain.icon} selected={hasDomainSelected(domain.type)} onClick={() => onToggleDomain(domain.type)}>
                {domain.text}
              </DomainSelector>
            ))}
          </div>
        </Section>
        <Section>
          <Title>Quel est votre projet professionnel ?</Title>
          <div className="grid grid-cols-2 gap-4">
            <SimpleSelect
              title="Projet professionnel"
              value={young.professionalProject}
              options={translateEnumToOptions(PROFESSIONNAL_PROJECT)}
              transformer={translate}
              onChange={changeProfessionalProject}
            />
            {young.professionalProject === PROFESSIONNAL_PROJECT.UNIFORM ? (
              <SimpleSelect
                title="Précisez"
                value={young.professionalProjectPrecision}
                options={translateEnumToOptions(PROFESSIONNAL_PROJECT_PRECISION)}
                transformer={translate}
                placeholder="Projet professionnel"
                onChange={changeProfessionalProjectPrecision}
              />
            ) : young.professionalProject === PROFESSIONNAL_PROJECT.OTHER ? (
              <SimpleInput title="Précisez" value={young.professionalProjectPrecision} placeholder="précisez votre projet" onChange={changeProfessionalProjectPrecision} />
            ) : (
              <div />
            )}
          </div>
        </Section>
        <Section>
          <pre>{JSON.stringify(young, null, 4)}</pre>
          <Title>Quelle période privilégiez-vous pour réaliser la mission d&apos;intérêt général ?</Title>
          <MiniTitle>Format préféré</MiniTitle>
          <ToggleGroup className="mb-8 text-center" value={young.missionFormat} onChange={changeMissionFormat} options={translateEnumToOptions(PREF_FORMATS)} />
          <MiniTitle>Période de réalisation de la mission</MiniTitle>
          <ToggleGroup className="mb-8 text-center" value={young.period} onChange={changePeriod} options={translateEnumToOptions(PERIOD, PREF_PERIOD_ICONS)} />
        </Section>
        <Section>
          <Title>Quelle est votre mobilité géographique ?</Title>
          <MiniTitle>Moyen(s) de transport privilégié(s)</MiniTitle>
          <MultiGroup className="mb-8 text-center" value={young.mobilityTransport} onChange={changeMobilityTransport} options={translateEnumToOptions(TRANSPORT)} />
          <MiniTitle>Périmètre de recherche</MiniTitle>
        </Section>
      </Box>
    </div>
  );
}
