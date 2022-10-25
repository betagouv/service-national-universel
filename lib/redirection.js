const WAITING_CORRECTION = [
  {
    field: ["firstName", "lastName", "email"],
    redirect: "/inscription2023/correction/profile",
  },
  {
    field: [
      "birthdateAt",
      "schooled",
      "grade",
      "schoolName",
      "schoolType",
      "choolAddress",
      "choolZip",
      "choolCity",
      "choolDepartment",
      "schoolRegion",
      "choolCountry",
      "schoolId",
      "zip",
    ],
    redirect: "/inscription2023/correction/eligibilite",
  },
  {
    field: [
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent1Phone",
      "parent2",
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "parent2Phone",
    ],
    redirect: "/inscription2023/correction/representants",
  },
  {
    field: [
      "gender",
      "frenchNationality",
      "birthCountry",
      "birthCity",
      "birthCityZip",
      "phone",
      "situation",
      "livesInFrance",
      "addressVerified",
      "country",
      "city",
      "zip",
      "address",
      "location",
      "department",
      "region",
      "cityCode",
      "foreignCountry",
      "foreignCity",
      "foreignZip",
      "foreignAddress",
      "hostLastName",
      "hostFirstName",
      "hostRelationship",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "allergies",
      "moreInformation",
      "specificAmenagment",
      "specificAmenagmentType",
      "reducedMobilityAccess",
      "handicapInSameDepartment",
    ],
    redirect: "/inscription2023/correction/coordonnee",
  },
  {
    field: ["cniFile"],
    redirect: "/inscription2023/correction/documents",
  },
];

const redirectToCorrection = (field) => {
  const correction = WAITING_CORRECTION.find((correction) =>
    correction.field.includes(field)
  );
  return correction ? correction.redirect : "/";
};

module.exports = {
  redirectToCorrection,
};
