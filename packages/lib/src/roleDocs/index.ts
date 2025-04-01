export type RolePermission = { name: string; value?: boolean; setting?: string; startAt?: string; endAt?: string };

type RoleDocument = {
  name: string;
  desc?: string;
  permissions: RolePermission[];
};

export const roleDocs: RoleDocument[] = [
  {
    name: "admin",
    desc: "Modérateur",
    permissions: [
      { name: "TRANSPORT:UPDATE", value: true },
      { name: "TRANSPORT:UPDATE_PDR_ID", value: true },
      { name: "TRANSPORT:UPDATE_PDR_SCHEDULE", value: true },
      { name: "TRANSPORT:UPDATE_TYPE", value: true },
      { name: "TRANSPORT:UPDATE_SESSION_ID", value: true },
      { name: "TRANSPORT:UPDATE_CENTER_SCHEDULE", value: true },
      { name: "TRANSPORT:SEND_NOTIFICATION", value: true },

      { name: "PHASE_1:POINTAGE", setting: "youngCheckinForAdmin" },

      { name: "CONTRACT:CREATE", value: true },
      { name: "CONTRACT:UPDATE", value: true },
      { name: "CONTRACT:READ", value: true },
    ],
  },
  {
    name: "transporter",
    desc: "Transporteur",
    permissions: [
      { name: "TRANSPORT:UPDATE", setting: "busEditionOpenForTransporter" },
      { name: "TRANSPORT:UPDATE_PDR_SCHEDULE", setting: "busEditionOpenForTransporter" },
      { name: "TRANSPORT:UPDATE_TYPE", setting: "busEditionOpenForTransporter" },
      { name: "TRANSPORT:UPDATE_CENTER_SCHEDULE", setting: "busEditionOpenForTransporter" },
    ],
  },
  {
    name: "head_center",
    desc: "Chef de centre de cohésion",
    permissions: [{ name: "PHASE_1:POINTAGE", setting: "youngCheckinForHeadOfCenter" }],
  },
  {
    name: "referent_region",
    permissions: [{ name: "PHASE_1:POINTAGE", setting: "youngCheckinForRegionReferent" }],
  },
  {
    name: "referent_department",
    permissions: [{ name: "PHASE_1:POINTAGE", setting: "youngCheckinForDepartmentReferent" }],
  },
  {
    name: "responsible",
    desc: "Responsable de structure",
    permissions: [
      { name: "CONTRACT:CREATE", value: true },
      { name: "CONTRACT:UPDATE", value: true },
      { name: "CONTRACT:READ", value: true },
    ],
  },
  {
    name: "supervisor",
    desc: "Superviseur de MIG",
    permissions: [
      { name: "CONTRACT:CREATE", value: true },
      { name: "CONTRACT:UPDATE", value: true },
      { name: "CONTRACT:READ", value: true },
    ],
  },
];
