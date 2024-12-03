import { config } from "../config";
import { capture } from "../sentry";

type Response = {
  ok: boolean;
  code?: number;
  data: JeVeuxAiderMission[];
  total: number;
};

export async function fetchMissions(skip = 0): Promise<Response> {
  return fetch(`${config.API_ENGAGEMENT_URL}/v2/mission?snu=true&skip=${skip}&limit=50`, {
    headers: { "x-api-key": config.API_ENGAGEMENT_KEY },
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => capture(error));
}

export async function fetchStructureById(id: string) {
  return fetch(`https://www.jeveuxaider.gouv.fr/api/api-engagement/organisations/${id}?apikey=${config.JVA_API_KEY}`, {
    method: "GET",
    redirect: "follow",
  })
    .then((response) => response.json())
    .catch((error) => capture(error));
}

export type JeVeuxAiderMission = {
  _id: string;
  clientId: string; // jvaMissionId
  publisherId: string;
  activity: string;
  address: string;
  applicationUrl: string;
  associationAddress: string;
  associationCity: string;
  associationDepartmentCode: string;
  associationDepartmentName: string;
  associationId: string;
  associationName: string;
  associationRNA: string;
  associationPostalCode: string;
  associationRegion: string;
  audience: string[];
  city: string;
  closeToTransport: string;
  country: string;
  createdAt: string;
  deleted: boolean;
  deletedAt: string;
  departmentCode: string;
  departmentName: string;
  description: string;
  descriptionHtml: string;
  domain: string;
  domainLogo: string;
  endAt: string;
  lastSyncAt: string;
  location: { lon: number; lat: number };
  metadata: string;
  openToMinors: string;
  organizationActions: string[];
  organizationBeneficiaries: string[];
  organizationCity: string;
  organizationClientId: string;
  organizationDescription: string;
  organizationFullAddress: string;
  organizationId: string;
  organizationLogo: string;
  organizationName: string;
  organizationPostCode: string;
  organizationRNA: string;
  organizationReseaux: string[];
  organizationSiren: string;
  organizationStatusJuridique: string;
  organizationType: string;
  organizationUrl: string;
  places: number;
  postalCode: string;
  postedAt: string;
  priority: string;
  publisherLogo: string;
  publisherName: string;
  publisherUrl: string;
  reducedMobilityAccessible: string;
  region: string;
  remote: string;
  schedule: string;
  snu: boolean;
  snuPlaces: number;
  soft_skills: string[];
  startAt: string;
  statusCode: string;
  statusComment: string;
  statusCommentHistoric: { status: string; comment: string; date: string; _id: string }[];
  tags: string[];
  tasks: string[];
  title: string;
  updatedAt: string;
};
