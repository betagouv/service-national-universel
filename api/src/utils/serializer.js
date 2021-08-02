function serializeApplication(application, user) {
  return {
    _id: application._id,
    youngId: application.youngId,
    youngFirstName: application.youngFirstName,
    youngLastName: application.youngLastName,
    youngEmail: application.youngEmail,
    youngBirthdateAt: application.youngBirthdateAt,
    youngCity: application.youngCity,
    youngDepartment: application.youngDepartment,
    youngCohort: application.youngCohort,
    missionId: application.missionId,
    missionName: application.missionName,
    missionDepartment: application.missionDepartment,
    missionRegion: application.missionRegion,
    structureId: application.structureId,
    tutorId: application.tutorId,
    contractId: application.contractId,
    tutorName: application.tutorName,
    priority: application.priority,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

function serializeBus(bus, user) {
  return {
    _id: bus._id,
    idExcel: bus.idExcel,
    capacity: bus.capacity,
    placesLeft: bus.placesLeft,
    createdAt: bus.createdAt,
    updatedAt: bus.updatedAt,
  };
}

function serializeCohesionCenter(center, user) {
  return {
    _id: center._id,
    name: center.name,
    code: center.code,
    country: center.country,
    COR: center.COR,
    departmentCode: center.departmentCode,
    address: center.address,
    city: center.city,
    zip: center.zip,
    department: center.department,
    region: center.region,
    placesTotal: center.placesTotal,
    placesLeft: center.placesLeft,
    outfitDelivered: center.outfitDelivered,
    observations: center.observations,
    waitingList: center.waitingList,
    createdAt: center.createdAt,
    updatedAt: center.updatedAt,
  };
}

module.exports = {
  serializeApplication,
  serializeBus,
  serializeCohesionCenter,
};
