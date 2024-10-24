import React from "react";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { getCohortPeriod } from "snu-lib";
import ArrowRightBlueSquare from "@/assets/icons/ArrowRightBlueSquare";
import Button from "@codegouvfr/react-dsfr/Button";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Select from "@codegouvfr/react-dsfr/Select";
import { group } from "console";

type GroupType = {
  id: string;
  name: string;
  sejours: { id: string; name: string; open: boolean; eligible: boolean }[];
};

const initialGroups: GroupType[] = [
  {
    id: "2024",
    name: "2024",
    sejours: [
      {
        id: "1",
        name: "Séjour 1",
        open: true,
        eligible: true,
      },
      {
        id: "2",
        name: "Séjour 2",
        open: true,
        eligible: true,
      },
      {
        id: "3",
        name: "Séjour 3",
        open: true,
        eligible: true,
      },
    ],
  },
  {
    id: "2025",
    name: "2025",
    sejours: [
      {
        id: "1",
        name: "Séjour 1",
        open: true,
        eligible: false,
      },
      {
        id: "2",
        name: "Séjour 2",
        open: true,
        eligible: false,
      },
      {
        id: "3",
        name: "Séjour 3",
        open: true,
        eligible: false,
      },
    ],
  },
];

export default function NewSejour() {
  const [groups, setGroups] = React.useState(initialGroups);
  const [year, setYear] = React.useState("2024");

  const currentGroup = groups.find((group) => group.id === year);
  const sejoursEligibles = currentGroup?.sejours.filter((sejour) => sejour.open).filter((sejour) => sejour.eligible) || [];

  const nextGroups = groups.filter((group) => group.id > year);
  const nextGroupsOpen = nextGroups.filter((group) => group.sejours.some((sejour) => sejour.open));

  const noticeTitle = currentGroup
    ? `Jean-Pierre CHANGE D'AVIS, vous êtes inscrit pour le séjour du 1er au 20 janvier ${currentGroup.name}.`
    : `Jean-Pierre CHANGE D'AVIS, Vous étiez inscrit pour le séjour du 1er au 20 janvier ${year}.`;

  return (
    <DSFRLayout title="Changer de séjour">
      <DSFRContainer title="Choisir un nouveau séjour" supportLink="/">
        <Notice title={noticeTitle} />
        <br />
        <section id="changer-de-sejour">
          {currentGroup &&
            (sejoursEligibles.length > 0 ? (
              <>
                <h2 className="text-2xl">
                  Je choisis un nouveau séjour en <strong>{currentGroup.name}</strong>
                </h2>
                <p>Séjours auxquels je suis éligible&nbsp;:</p>
                {sejoursEligibles.map((sejour) => (
                  <SessionButton key={sejour.id} session={sejour} onSubmit={(session) => console.log(session)} />
                ))}
                <br />
              </>
            ) : (
              <p>Aucun autre séjour n'est disponible pour l'année en cours.</p>
            ))}
        </section>

        {nextGroupsOpen.length ? (
          nextGroupsOpen.map((group) => (
            <>
              <hr />
              <section key={group.name} id={`reinscription-${group.name}`}>
                <h2 className="text-2xl">
                  Je souhaite m'inscrire pour l'année <strong>{group.name}</strong>
                </h2>
                <p>Je mets à jour mes informations et choisis un nouveau séjour en {group.name}.</p>
                <Button
                  onClick={() => {
                    if (!window.confirm("Attention, cela va vous désinscrire du séjour actuel")) {
                      return;
                    }
                    console.log("Reinscription");
                  }}>
                  Vérifier mon éligibilité
                </Button>
              </section>
              <br />
            </>
          ))
        ) : (
          <section id="a-venir">
            <h2 className="text-2xl">Je souhaite m'inscrire pour l'année prochaine</h2>
            <p>
              Annuler mon inscription actuelle et me positionner pour un séjour <strong>à venir</strong>. Je serais contacté en priorité par email lors de l'ouverture des
              inscriptions.
            </p>
            <Button onClick={() => console.log("A venir")}>Me positionner</Button>
            <br />
            <br />
          </section>
        )}

        <hr />
        <br />
        <section id="desistement">
          <p>Aucun de ces choix ne me convient&nbsp;:</p>
          <div className="flex gap-4">
            <Button priority="secondary" onClick={() => console.log("A venir")}>
              Retour à l'accueil
            </Button>
            <Button priority="secondary" onClick={() => console.log("A venir")}>
              Me désister
            </Button>
          </div>
        </section>
      </DSFRContainer>

      <DSFRContainer title="Config">
        <Select
          label="Groupe de cohortes du volontaire"
          nativeSelectProps={{
            value: year,
            onChange: (e) => setYear(e.target.value),
          }}>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </Select>

        {groups.map((group) => (
          <div key={group.id}>
            <h2 className="text-2xl">{group.name}</h2>
            <ul>
              {group.sejours.map((sejour) => (
                <li key={sejour.id}>
                  {sejour.name}
                  <div className="flex gap-4">
                    <label>
                      Inscriptions ouvertes :{" "}
                      <input
                        type="checkbox"
                        checked={sejour.open}
                        onChange={() =>
                          setGroups((prev) =>
                            prev.map((g) => (g.id === group.id ? { ...g, sejours: g.sejours.map((s) => (s.id === sejour.id ? { ...s, open: !s.open } : s)) } : g)),
                          )
                        }
                      />
                    </label>
                    <label>
                      Éligible :{" "}
                      <input
                        type="checkbox"
                        checked={sejour.eligible}
                        onChange={() =>
                          setGroups((prev) =>
                            prev.map((g) => (g.id === group.id ? { ...g, sejours: g.sejours.map((s) => (s.id === sejour.id ? { ...s, eligible: !s.eligible } : s)) } : g)),
                          )
                        }
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
            <br />
          </div>
        ))}
      </DSFRContainer>
    </DSFRLayout>
  );
}

function SessionButton({ session, onSubmit }) {
  return (
    <div
      key={session.id}
      className="my-3 flex cursor-pointer items-center justify-between border p-4 hover:bg-gray-50"
      onClick={() => {
        // plausibleEvent(session.event);
        onSubmit(session.name);
      }}>
      <div>
        Séjour <strong>{getCohortPeriod(session)}</strong>
      </div>
      <ArrowRightBlueSquare />
    </div>
  );
}
