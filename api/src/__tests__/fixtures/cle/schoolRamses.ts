export default function getSchoolRamsesFixture(object = {}) {
  return {
    uai: "0010802S",
    fullName: "Collège Ampère",
    type: "CLG",
    departmentName: "Ain",
    region: "Auvergne-Rhône-Alpes",
    country: "FRANCE",
    city: "Oyonnax",
    postcode: "01101",
    codeCity: "01283",
    department: "001",
    codePays: "100",
    ...object,
  };
}
