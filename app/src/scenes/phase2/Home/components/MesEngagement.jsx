import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchApplications, fetchEquivalences } from "../repo";
import Loader from "@/components/Loader";
import { Link } from "react-router-dom";
import { HiLocationMarker } from "react-icons/hi";
import IconDomain from "@/scenes/missions/components/IconDomain";
import { APPLICATION_STATUS, translateApplication } from "snu-lib";

const applicationExample = {
  _id: "603398dff5936243c9b2479e",
  status: "DONE",
  sqlId: "1",
  missionId: "60338f3af9392c635dccdae3",
  missionName: "Distribution alimentaire",
  missionDepartment: "Loire-Atlantique",
  missionRegion: "Pays de la Loire",
  structureId: "6033859428cc1009a723d927",
  youngId: "603390f6b00e1277e13bbdca",
  youngFirstName: "Noah",
  youngLastName: "BEN ABDESSALEM",
  youngEmail: "noaben@hotmail.fr",
  youngDepartment: "Loire-Atlantique",
  createdAt: "2020-07-07T07:07:07.000Z",
  updatedAt: "2023-01-13T14:31:11.810Z",
  __v: 2,
  tutorId: "60338aa7454eb9388d60b222",
  tutorName: "Martine UL.NANTES@CROIX-ROUGE.FR",
  youngCohort: "2019",
  contractAvenantFiles: [],
  contractStatus: "DRAFT",
  feedBackExperienceFiles: [],
  isJvaMission: "false",
  justificatifsFiles: [],
  othersFiles: [],
  filesType: [],
  mission: {
    _id: "60338f3af9392c635dccdae3",
    domains: ["SOLIDARITY"],
    format: "DISCONTINUOUS",
    period: ["DURING_HOLIDAYS"],
    placesTotal: 6,
    placesLeft: 2,
    placesTaken: 4,
    status: "ARCHIVED",
    name: "DISTRIBUTION ALIMENTAIRE",
    frequence: "Lundi, mardi, jeudi, vendredi en fonction des disponibilités des jeunes",
    description: "Matinée : consacrée au tri, rangement et scannage des marchandises réceptionnées\nAprès midi, aide à la composition des caddies pour les bénéficiaires",
    address: "Nantes",
    zip: "44300",
    city: "Nantes",
    department: "Loire-Atlantique",
    country: "France",
    actions: "tri, rangement scannage\nAide à la composition des caddies des bénéficiaires",
    justifications: "Contact et aides aux personnes les plus démunies.",
    contraintes: "Non",
    sqlId: "1004",
    sqlStructureId: "1143",
    structureId: "6033859428cc1009a723d927",
    structureName: "Croix-rouge Française",
    sqlTutorId: "2210",
    tutorId: "60338aa7454eb9388d60b222",
    location: {
      lon: -1.55392,
      lat: 47.2173,
    },
    remote: "false",
    region: "Pays de la Loire",
    endAt: "2021-06-30T18:00:00.000Z",
    startAt: "2020-09-01T09:00:00.000Z",
    createdAt: "2021-02-22T11:02:18.251Z",
    updatedAt: "2023-01-11T17:31:14.246Z",
    __v: 2,
    tutorName: "Martine UL.NANTES@CROIX-ROUGE.FR",
    subPeriod: ["SUMMER", "AUTUMN", "DECEMBER", "WINTER", "SPRING"],
    isMilitaryPreparation: "false",
    mainDomain: "SOLIDARITY",
    statusComment: "",
    isJvaMission: "false",
    visibility: "VISIBLE",
    pendingApplications: 0,
    applicationStatus: [
      "DONE",
      "CANCEL",
      "CANCEL",
      "REFUSED",
      "CANCEL",
      "CANCEL",
      "REFUSED",
      "REFUSED",
      "REFUSED",
      "DONE",
      "DONE",
      "REFUSED",
      "REFUSED",
      "REFUSED",
      "REFUSED",
      "REFUSED",
      "CANCEL",
      "REFUSED",
      "REFUSED",
      "CANCEL",
      "REFUSED",
      "REFUSED",
      "REFUSED",
      "DONE",
      "CANCEL",
    ],
    hebergementPayant: "",
    placesStatus: "ONE_OR_MORE",
  },
};

export function MesEngagements() {
  return (
    <div className="p-3  bg-gradient-to-b from-white to-gray-100">
      <section className="max-w-5xl mx-auto">
        <div className="flex justify-between">
          <h2 className="font-bold m-0">Mes engagements</h2>
          <Link to="/" className="text-blue-600">
            Voir
          </Link>
        </div>
        <EngagementList />
      </section>
    </div>
  );
}

function EngagementList() {
  const { young } = useSelector((state) => state.Auth);

  const mockApplications = Object.keys(APPLICATION_STATUS).map((status) => ({ ...applicationExample, status }));

  const {
    isPending: isPendingEquivalences,
    error: errorEquivalences,
    data: equivalences,
  } = useQuery({
    queryKey: ["equivalences"],
    queryFn: () => fetchEquivalences(young._id),
    refetchOnWindowFocus: false,
  });
  console.log("🚀 ~ EngagementList ~ equivalences:", equivalences);

  const {
    isPending: isPendingApplications,
    error: errorApplications,
    data: applications,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: () => fetchApplications(young._id),
    refetchOnWindowFocus: false,
  });
  console.log("🚀 ~ EngagementList ~ applications:", applications);

  if (isPendingEquivalences || isPendingApplications) return <Loader />;

  if (errorEquivalences || errorApplications) {
    return <div className="mt-8 mb-4 bg-white rounded-lg shadow-sm p-12">Erreur lors du chargement des engagements réalisés 🥲</div>;
  }
  if (equivalences.length === 0 && applications.length === 0) {
    return (
      <div className="mt-8 mb-4 bg-white rounded-lg shadow-sm p-12">
        <p className="text-center">Vous n’avez aucun engagement en cours 🥲</p>
      </div>
    );
  }
  return (
    <div className="flex gap-4 mt-4 snap-x snap-mandatory overflow-scroll pb-4">
      {mockApplications.map((application) => (
        <ApplicationCard key={application._id} application={application} />
      ))}
    </div>
  );
}

// case "WAITING_VALIDATION":
//   return "Candidature en attente de validation";
// case "WAITING_VERIFICATION":
//   return "En attente de vérification d'éligibilité";
// case "WAITING_ACCEPTATION":
//   return "Proposition de mission en attente";
// case "VALIDATED":
//   return "Candidature approuvée";
// case "REFUSED":
//   return "Candidature non retenue";
// case "CANCEL":
//   return "Candidature annulée";
// case "IN_PROGRESS":
//   return "Mission en cours";
// case "DONE":
//   return "Mission effectuée";
// case "ABANDON":
//   return "Mission abandonnée";
// case "N/A":
//   return "Aucune candidature ni proposition";
// default:
//   return candidature;

const badgeStyle = {
  WAITING_VALIDATION: "blue-500",
  DONE: "text-green-700 bg-green-100",
  CANCEL: "border-yellow-500",
  REFUSED: "border-red-500",
};

function ApplicationCard({ application }) {
  console.log("🚀 ~ ApplicationCard ~ application:", application);
  return (
    <div className="bg-white rounded-xl border p-3 w-96 h-44 flex flex-col justify-between flex-none snap-always snap-center">
      <p className={`text-xs rounded-full px-2 py-1 w-fit ${badgeStyle[application.status]}`}>{translateApplication(application.status)}</p>

      <p className="text-xs leading-5 text-gray-400">{application.mission.structureName}</p>

      <div className="flex items-center gap-4">
        <IconDomain domain={application.mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : application.mission?.mainDomain} />
        <p className="text-lg font-bold line-clamp-2">{application.missionName}</p>
      </div>

      <div className="flex justify-between items-end">
        <p className="text-xs leading-5 text-gray-400">{application.mission.placesLeft} places disponibles</p>
        <div>
          <HiLocationMarker className="inline-block text-gray-300 mr-1" />
          <span className="text-xs leading-5 text-gray-400">{application.mission.city}</span>
        </div>
      </div>
    </div>
  );
}
