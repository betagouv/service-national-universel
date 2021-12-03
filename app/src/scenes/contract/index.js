import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import queryString from "query-string";

import api from "../../services/api";
import Loader from "../../components/Loader";
import { Box } from "../../components/box";
import { VioletButton } from "../../components/Content";
import Badge from "../../components/Badge";
import { APPLICATION_STATUS_COLORS, formatDateFR } from "../../utils";

export default function Index() {
  const [context, setContext] = useState(null);
  const history = useHistory();
  const params = queryString.parse(location.search);
  const { token } = params;

  useEffect(() => {
    (async () => {
      try {
        const { ok, data } = await api.get(`/contract/token/${token}`);
        if (!ok) return toastr.error("Impossible charger le contrat d'engagement");
        setContext(data);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  if (!token || !context) return <Loader />;

  return (
    <div>
      <div style={{ display: "flex", margin: "2rem" }}>
        <Box style={{ margin: "auto", maxWidth: "900px" }}>
          <ContractContainer>
            <div style={{ display: "flex", marginBottom: "3rem" }}>
              <div style={{ marginRight: "2rem" }}>
                <img src={require("../../assets/logo-snu.png")} height={96} />
              </div>
              <div style={{ marginRight: "2rem", textAlign: "center", marginTop: "-1rem" }}>
                <h2>Contrat d’engagement en mission d’intérêt général (MIG) du service national universel (SNU)</h2>
              </div>
            </div>
            <div>
              <p>
                Le décret n° 2020-922 du 29 juillet 2020 portant dispositions diverses relatives au service national universel a créé la « Réserve du service national universel »,
                nouvelle réserve civique relevant des dispositions de la loi du 27 janvier 2017 relative à l’égalité et à la citoyenneté. Dans ce nouveau cadre réglementaire, les
                missions d’intérêt général revêtent « un caractère philanthropique, éducatif, environnemental, scientifique, social, sportif, familial ou culturel, ou concourent à
                des missions de défense et de sécurité civile ou de prévention ou à la prise de conscience de la citoyenneté française et européenne ». Le décret du 29 juillet 2020
                a précisé qu’une mission d’intérêt général correspond à un engagement volontaire d’une durée minimale de quatre-vingt-quatre heures, qui peut être accomplie de
                manière continue ou, dans la limite d’une période d’une année, de manière discontinue.
              </p>
            </div>
            <div>
              <h2>Entre les soussignés,</h2>
              <div>
                <h3> L’Etat, représenté par</h3>
                <div>
                  <ContractField name="projectManagerFirstName" placeholder="Prénom" context={context} />
                  <ContractField name="projectManagerLastName" placeholder="Nom" context={context} />
                  agissant en qualité de
                  <ContractField name="projectManagerRole" placeholder="Rôle" className="md" context={context} />
                  <div>
                    Email :
                    <ContractField name="projectManagerEmail" placeholder="Email" className="md" context={context} />
                  </div>
                </div>
              </div>
              <h2>ET</h2>
              <div>
                <h3> La structure d’accueil représentée par</h3>
                <div>
                  <ContractField name="structureManagerFirstName" placeholder="Prénom" context={context} />
                  <ContractField name="structureManagerLastName" placeholder="Nom" context={context} />
                  agissant en qualité de
                  <ContractField name="structureManagerRole" placeholder="Rôle" className="md" context={context} />
                  <div>
                    Email :
                    <ContractField name="structureManagerEmail" placeholder="Email" className="md" context={context} />
                  </div>
                  <div>
                    Siret (optionnel) :
                    <ContractField name="structureSiret" placeholder="12345678901234" className="md" context={context} optional={true} />
                  </div>
                </div>
              </div>
              <h2>ET</h2>
              <div>
                <h3> Le volontaire</h3>
                <div>
                  <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                  <ContractField name="youngLastName" placeholder="Nom" context={context} />
                  <div>
                    né le :
                    <ContractField name="youngBirthdate" context={context} type="date" placeholder="jj/mm/yyyy" />
                  </div>
                  <div>
                    demeurant :
                    <ContractField name="youngAddress" placeholder="Adresse" className="md" context={context} />
                    <ContractField name="youngCity" placeholder="Ville" context={context} />
                    <ContractField name="youngDepartment" placeholder="Département" context={context} />
                  </div>
                  Email : <ContractField name="youngEmail" placeholder="Email" className="md" type="email" context={context} />
                  Téléphone :
                  <ContractField name="youngPhone" placeholder="0123456789" className="md" context={context} />
                </div>
              </div>
              <hr />
              {context.isYoungAdult !== "true" ? (
                <>
                  <h2>Représenté par ses représentant légaux</h2>
                  <div>
                    1) Le représentant légal du volontaire n°1 :
                    <ContractField name="parent1FirstName" placeholder="Prénom" context={context} />
                    <ContractField name="parent1LastName" placeholder="Nom" context={context} />
                    disposant de l’autorité parentale,
                    <div>
                      demeurant à
                      <ContractField name="parent1Address" placeholder="Adresse" className="md" context={context} />
                      <ContractField name="parent1City" placeholder="Ville" context={context} />
                      <ContractField name="parent1Department" placeholder="Département" context={context} />
                    </div>
                    Email : <ContractField name="parent1Email" placeholder="Email" className="md" type="email" context={context} />
                    Téléphone :
                    <ContractField name="parent1Phone" placeholder="0123456789" className="md" context={context} />
                  </div>
                  {context["parent2Email"] && (
                    <div>
                      2) Le représentant légal du volontaire n°2 :
                      <ContractField name="parent2FirstName" placeholder="Prénom" context={context} optional={true} />
                      <ContractField name="parent2LastName" placeholder="Nom" context={context} optional={true} />
                      disposant de l’autorité parentale,
                      <div>
                        demeurant à
                        <ContractField name="parent2Address" placeholder="Adresse" className="md" context={context} optional={true} />
                        <ContractField name="parent2City" placeholder="Ville" context={context} optional={true} />
                        <ContractField name="parent2Department" placeholder="Département" context={context} optional={true} />
                      </div>
                      Email : <ContractField name="parent2Email" placeholder="Email" className="md" type="email" context={context} />
                      Téléphone :
                      <ContractField name="parent2Phone" placeholder="0123456789" className="md" context={context} optional={true} />
                    </div>
                  )}
                </>
              ) : null}
              <div>
                <br />
                <p>Il a été convenu ce qui suit :</p>
              </div>
              <h3>a) Objet</h3>
              <div>
                <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                <ContractField name="youngLastName" placeholder="Nom" context={context} />
                s’engage à réaliser une mission d’intérêt général validée par l’autorité territoriale en charge du SNU.
                <div>
                  La mission
                  <ContractField className="lg" name="missionName" placeholder="Nom de la mission" context={context} />
                  <br />
                </div>
                <div>
                  Les objectifs de la missions sont les suivants :
                  <ContractField name="missionObjective" placeholder="Objectifs" as="textarea" context={context} />
                </div>
                <div>
                  A ce titre, le volontaire exercera les activités suivantes :
                  <ContractField name="missionAction" placeholder="Actions" as="textarea" context={context} />
                </div>
                <p>
                  La nature ou l’exercice des missions ne peuvent porter sur les activités relevant des articles D. 4153-15 à D. 4153-40 du code du travail c’est-à-dire les
                  catégories de travaux définies en application de l’article L. 4153-8 du même code, interdites aux jeunes de moins de 18 ans, en ce qu’elles les exposeraient à des
                  risques pour leur santé, leur sécurité, leur moralité ou excéderaient leurs forces.
                </p>
              </div>
              <h3>b) Date d’effet et durée du contrat</h3>
              <div>
                Le présent contrat, pour la réalisation de la mission indiquée ci-dessus, prend effet à la date de signature du présent contrat par les trois parties prenantes.{" "}
                <br />
                La mission d’intérêt général débute le
                <ContractField name="missionStartAt" placeholder="jj/mm/yyyy" type="date" context={context} />
                jusqu’au
                <ContractField name="missionEndAt" placeholder="jj/mm/yyyy" type="date" context={context} />
                <br /> Le volontaire effectuera un total de
                <ContractField name="missionDuration" placeholder="nombre d'heure" context={context} />
                heures de MIG.
              </div>
              <h3>c) Conditions d’exercice des missions</h3>
              <div>
                La mission s’effectue à
                <ContractField className="md" name="missionAddress" placeholder="adresse" context={context} />
                <ContractField name="missionCity" placeholder="Ville" context={context} />
                <ContractField name="missionZip" placeholder="Code postal" context={context} />
                <br />
                au sein de la structure d’accueil retenue par l’administration :
                <ContractField className="lg" name="structureName" placeholder="Nom de la structure" context={context} />
                <p>
                  La durée quotidienne de la mission est égale à sept heures au maximum. Une pause de trente minutes doit être appliquée pour toute période de mission ininterrompue
                  atteignant quatre heures et demie.
                </p>
                <p>
                  Les missions effectuées entre 22 heures et 6 heures sont interdites. Pour les missions effectuées de manière continue, le repos hebdomadaire est de deux jours
                  consécutifs au minimum.
                </p>
                <p>Si le volontaire est scolarisé, la mission ne peut être effectuée sur le temps scolaire.</p>
                <p>
                  Si le volontaire travaille, le temps de travail cumulé avec le temps d’accomplissement de la mission d’intérêt général ne peut excéder 7 heures par jour et 35
                  heures par semaine.
                </p>
                <p>Les horaires du volontaire pour la présente mission sont :</p>
                <ContractField name="missionFrequence" placeholder="Du lundi au vendredi" as="textarea" context={context} />
                Le volontaire bénéficie, pour assurer l’accomplissement de sa mission, de l’accompagnement d’un tuteur de mission
                <ContractField name="structureManagerFirstName" placeholder="Prénom" context={context} />
                <ContractField name="structureManagerLastName" placeholder="Nom" context={context} />
                de la structure d’accueil. Le volontaire bénéficie, par son tuteur, d’entretiens réguliers permettant un suivi de la réalisation des missions ainsi que, le cas
                échéant, d’un accompagnement renforcé.
              </div>
              <h3>d) Obligations réciproques des parties</h3>
              <div>
                <p>
                  L’Etat s’engage à identifier les missions susceptibles d’être proposées au volontaire dans le cadre des missions d’intérêt général. L’Etat s’assure de la qualité
                  des conditions de réalisation de cette mission au regard des finalités du SNU. Enfin, l’Etat valide la réalisation de la mission du volontaire. La structure
                  d’accueil s’engage à proposer des missions permettant la mobilisation du volontaire en faveur de l’intérêt général. Un mentor est nommé au sein de la structure
                  afin de s’assurer du suivi du volontaire et de la qualité des conditions de son accueil.
                </p>
                <p>
                  Le cas échéant, la structure d’accueil précise les frais qu’elle entend prendre en charge, totalement ou partiellement, dans le cadre de la mission d’intérêt
                  général (frais de transports, repas, hébergement…).
                </p>
                <p>
                  Le volontaire s’engage à respecter le règlement intérieur de la structure qui l’accueille, à respecter les personnes, le matériel et les locaux et à agir en
                  conformité avec les exigences de son engagement dans le cadre du SNU : ponctualité, politesse, implication. Le volontaire est tenu à la discrétion pour les faits
                  et informations dont il a connaissance dans l’exercice de ses missions. Il est également tenu aux obligations de convenance et de réserve inhérentes à ses
                  fonctions.
                </p>
                <p>Le volontaire exécute la mission d’intérêt général à titre bénévole.</p>
                <p>
                  L&apos;engagement, l&apos;affectation et l&apos;activité du volontaire ne sont régis ni par le code du travail, ni par le chapitre Ier de la loi n° 84-16 du 11
                  janvier 1984 portant dispositions statutaires relatives à la fonction publique de l&apos;Etat, le chapitre Ier de la loi n° 84-53 du 26 janvier 1984 portant
                  dispositions statutaires relatives à la fonction publique territoriale ou le chapitre Ier de la loi n° 86-33 du 9 janvier 1986 portant dispositions statutaires
                  relatives à la fonction publique hospitalière. Le cas échéant, la structure d’accueil, directement ou par le mentor désigné, informe le représentant de l’Etat,
                  signataire du présent contrat, des difficultés rencontrées dans l’exécution du présent contrat.
                </p>
                <p>
                  Conformément aux dispositions du décret n° 2020-922 du 29 juillet 2020 portant diverses dispositions relatives au service national universel, le volontaire et la
                  structure d’accueil s’engagent à respecter les principes directeurs ainsi que les engagements et obligations des réservistes et des structures d’accueil énoncés
                  par la charte de la réserve civique, annexée au présent contrat, dans sa version issue du décret n° 2017-930 du 9 mai 2017.
                </p>
              </div>
              <h3>e) Journée de fin de mission d’intérêt général</h3>
              <div>
                <p>
                  Une journée de fin de mission d’intérêt général est organisée, en dehors des heures de MIG mentionnées au b), pour préparer une éventuelle participation du
                  volontaire à la phase III du SNU, soit un engagement volontaire de plusieurs mois, notamment dans le cadre du service civique ou du volontariat des armées.
                </p>
                <p>La participation du volontaire est requise.</p>
              </div>
              <h3>f) Responsabilités</h3>
              <div>
                <p>La structure d’accueil est chargée de la surveillance et de la sécurité du volontaire accueilli.</p>
                <p>L&apos;organisme d&apos;accueil le couvre des dommages subis par lui ou causés à des tiers dans l&apos;accomplissement de sa mission.</p>
              </div>
              <h3>g) Résiliation du contrat</h3>
              <div>
                <p>
                  Le présent contrat de mission d’intérêt général peut être résilié moyennant un préavis d’une journée sauf en cas de force majeure ou de faute grave d’une des
                  parties.
                </p>
                <p>Avant de résilier le contrat, la structure d’accueil prévient le représentant de l’Etat</p>
              </div>
              <h3>h) Conditions de validation de la mission d’intérêt général</h3>
              <div>
                La confirmation de la réalisation de la mission d&apos;intérêt général est effectuée par le tuteur de mission qui, au nom de la structure d&apos;accueil, effectue
                la procédure de fin de mission sur la plateforme.
                <br />
                La validation est conditionnée à la réalisation de
                <ContractField name="missionDuration" placeholder="nombre d'heure" context={context} />
                heures de mission au minimum au sein de la structure.
                <br />
                La mission est accomplie de manière continue, ou dans la limite de la période d’une année, de manière discontinue.
              </div>
              <div>
                Le
                <ContractField name="date" placeholder="date" type="date" context={context} />
              </div>

              <div>
                <br />
                <div>
                  Représentant de l’Etat{" "}
                  {context?.invitationSent === "true" ? (
                    <Badge
                      text={context.projectManagerStatus === "VALIDATED" ? "Validé" : "En attente de validation"}
                      color={context.projectManagerStatus === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                    />
                  ) : (
                    <Badge text="Pas encore envoyé" />
                  )}
                </div>
              </div>
              <div>
                <div>
                  Représentant de la structure d’accueil{" "}
                  {context?.invitationSent === "true" ? (
                    <Badge
                      text={context.structureManagerStatus === "VALIDATED" ? "Validé" : "En attente de validation"}
                      color={context.structureManagerStatus === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                    />
                  ) : (
                    <Badge text="Pas encore envoyé" />
                  )}
                </div>
              </div>
              {context.isYoungAdult !== "true" ? (
                <>
                  <div>
                    Le volontaire, <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                    <ContractField name="youngLastName" placeholder="Nom" context={context} />
                    représenté par ses représentant légaux :
                  </div>
                  <div>
                    <br />
                    <div>
                      Représentant légal du volontaire (1){" "}
                      {context?.invitationSent === "true" ? (
                        <Badge
                          text={context.parent1Status === "VALIDATED" ? "Validé" : "En attente de validation"}
                          color={context.parent1Status === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                        />
                      ) : (
                        <Badge text="Pas encore envoyé" />
                      )}
                    </div>
                  </div>
                  {context.parent2Email && (
                    <div>
                      <div>
                        Représentant légal du volontaire (2){" "}
                        {context?.invitationSent === "true" ? (
                          <Badge
                            text={context.parent2Status === "VALIDATED" ? "Validé" : "En attente de validation"}
                            color={context.parent2Status === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                          />
                        ) : (
                          <Badge text="Pas encore envoyé" />
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    Le volontaire, <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                    <ContractField name="youngLastName" placeholder="Nom" context={context} />
                  </div>
                  <div>
                    <br />
                    <div>
                      Le volontaire{" "}
                      {context?.invitationSent === "true" ? (
                        <Badge
                          text={context.youngContractStatus === "VALIDATED" ? "Validé" : "En attente de validation"}
                          color={context.youngContractStatus === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                        />
                      ) : (
                        <Badge text="Pas encore envoyé" />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div>
              <h2>CHARTE DE LA RÉSERVE CIVIQUE</h2>
              <h3>1° Principes directeurs</h3>
              <p>
                La réserve civique permet à toute personne qui le souhaite de s&apos;engager à servir les valeurs de la République en participant à des missions d&apos;intérêt
                général, à titre bénévole et occasionnel.
              </p>
              <p>
                La réserve civique, ses sections territoriales et les réserves thématiques qu&apos;elle comporte favorisent la participation de tout citoyen à ces missions, dans un
                cadre collectif, ponctuel ou, à titre exceptionnel, récurrent, quelles que soient ses aptitudes et compétences. Elle concourt au renforcement du lien social en
                favorisant la mixité sociale.
              </p>
              <p>
                Les domaines d&apos;actions de la réserve civique, de ses sections territoriales et des réserves thématiques recouvrent des champs d&apos;actions variés : la
                solidarité, l&apos;éducation, la culture, la santé, l&apos;environnement, le sport, la mémoire et la citoyenneté, la coopération internationale, la sécurité ou
                encore les interventions d&apos;urgence en situation de crise ou d&apos;événement exceptionnel.
              </p>
              <p>
                La réserve civique est complémentaire des autres formes d&apos;engagement citoyen que sont, d&apos;une part, la garde nationale et les réserves opérationnelles et,
                d&apos;autre part, l&apos;engagement bénévole et volontaire.
              </p>
              <h3>2° Engagements et obligations des réservistes et des organismes d&apos;accueil</h3>
              <p>L&apos;affectation à une mission nécessite l&apos;accord de l&apos;organisme d&apos;accueil et du réserviste.</p>
              <h4>A. - Engagements et obligations des réservistes</h4>
              <p>
                Sous réserve de satisfaire aux conditions légales et réglementaires qui régissent la réserve civique et ses sections territoriales et aux règles spécifiques propres
                aux réserves thématiques qu&apos;elle comporte, peut être réserviste toute personne volontaire souhaitant s&apos;engager dans le respect des principes directeurs de
                la réserve civique.
              </p>
              <p>Toute personne qui participe à la réserve civique, ses sections territoriales ou l&apos;une des réserves thématiques qu&apos;elle comporte s&apos;engage à :</p>
              <ul>
                <li>respecter la présente charte ;</li>
                <li>apporter son concours à titre bénévole ;</li>
                <li>s&apos;engager pour une période déterminée, qui peut être renouvelée avec son accord ;</li>
                <li>
                  accomplir la mission pour laquelle elle est mobilisée selon les instructions données par le responsable de l&apos;organisme au sein duquel elle effectue sa
                  mission (ou par toute personne que ce responsable a désignée) en tenant compte des règles de service et de fonctionnement ;
                </li>

                <li>faire preuve d&apos;une disponibilité adaptée aux exigences de son engagement ;</li>
                <li>observer un devoir de réserve, de discrétion et de neutralité pendant l&apos;exercice de sa mission ;</li>
                <li>faire preuve de bienveillance envers toute personne en contact avec une mission de la réserve ;</li>
                <li>rendre compte de sa mission à l&apos;organisme qui l&apos;accueille ;</li>
                <li>signaler à l&apos;autorité de gestion de la réserve compétente tout incident ou anomalie survenu à l&apos;occasion de sa période d&apos;engagement ;</li>

                <li>promouvoir l&apos;engagement citoyen sous toutes ses formes.</li>
              </ul>
              <h4>B. - Engagements et obligations des organismes d&apos;accueil</h4>
              <p>
                Les organismes qui accueillent les réservistes sont les services de l&apos;Etat, les personnes morales de droit public, notamment les établissements publics et les
                collectivités territoriales, ainsi que les organismes sans but lucratif de droit français qui portent un projet d&apos;intérêt général, répondant aux orientations
                de la réserve civique et aux valeurs qu&apos;elle promeut.
              </p>
              <p>
                Une association cultuelle ou politique, une organisation syndicale, une congrégation, une fondation d&apos;entreprise ou un comité d&apos;entreprise ne peut
                accueillir de réserviste.
              </p>
              <p>
                Les organismes éligibles proposent aux réservistes des missions compatibles avec leurs obligations professionnelles. Il ne peut être opposé à l&apos;employeur une
                quelconque forme de réquisition.
              </p>
              <p>
                Les missions impliquant une intervention récurrente de réservistes citoyens sont préalablement validées par l&apos;autorité de gestion compétente de la réserve
                civique.
              </p>
              <p>Les organismes d&apos;accueil s&apos;engagent à :</p>
              <li>respecter la présente charte ;</li>
              <li>proposer des missions conformes à l&apos;objet de la réserve civique, ses sections territoriales et ses réserves thématiques ;</li>
              <li>proposer des missions non substituables à un emploi ou à un stage ;</li>
              <li>préparer le réserviste à l&apos;exercice de sa mission ;</li>
              <li>prendre en considération les attentes, les compétences et les disponibilités exprimées par le réserviste au regard des besoins de la mission proposée ;</li>
              <li>le cas échéant, compléter la convention d&apos;engagement décrivant précisément la mission du réserviste (fréquence, lieu d&apos;exercice, durée) ;</li>
              <li>attester du déroulement de la mission ;</li>
              <li>participer à des actions de communication, de sensibilisation et de promotion de la réserve civique ;</li>
              <li>couvrir le réserviste contre les dommages subis par lui ou causés à des tiers dans l&apos;accomplissement de sa mission.</li>
              <p>
                Les organismes d&apos;accueil peuvent par ailleurs rembourser les frais réellement engagés par le réserviste dans l&apos;exercice de la mission qu&apos;ils lui ont
                confiée.
              </p>
              <p>
                Tout manquement aux principes et engagements énoncés par la présente charte justifie qu&apos;il soit mis fin à la participation de la personne ou de
                l&apos;organisme concerné à la réserve civique, ses sections territoriales ou ses réserves thématiques.
              </p>
            </div>
          </ContractContainer>
        </Box>
      </div>
      <div style={{ marginTop: "1rem", marginBottom: "2rem", textAlign: "center" }}>
        <div>J&apos;atteste avoir lu et approuver les éléments renseignés ci-dessus.</div>
        <VioletButton
          onClick={async () => {
            try {
              const { ok } = await api.post(`/contract/token/${token}`);
              if (!ok) return toastr.error("Impossible de mettre à jour le contrat d'engagement");
            } catch (e) {
              return toastr.error("Impossible de mettre à jour le contrat d'engagement");
            }
            return history.push("/validate-contract/done");
          }}>
          Je valide le contrat d&apos;engagement
        </VioletButton>
      </div>
    </div>
  );
}

const ContractContainer = styled.div`
  font-size: 1rem;
  padding: 3rem;
  margin: auto;
  input,
  textarea {
    padding: 0.5rem;
    margin: 1rem 0.25rem 0 0.25rem;
    background-color: #f3f2ff;
    border: 1px solid #372f78;
    border-radius: 8px;
  }
  input::placeholder {
    color: #b3b2bf;
  }
  textarea {
    width: 100%;
    height: 130px;
  }
  input.md {
    width: 250px;
  }
  input.lg {
    width: 400px;
  }
  h2,
  h3,
  h4 {
    font-weight: bold;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }
  h2 {
    margin-top: 2rem;
    font-size: 1.25rem;
  }
  h3 {
    font-size: 1.175rem;
  }
  h4 {
    font-size: 1rem;
  }
`;

const ContractField = ({ name, context, type }) => {
  if (type === "date" && context[name]) return <SuperSpan> {formatDateFR(context[name]) || "…"} </SuperSpan>;
  return <SuperSpan> {context[name] || "…"} </SuperSpan>;
};

const SuperSpan = styled.span`
  color: #5245cc;
  font-weight: 500;
`;
