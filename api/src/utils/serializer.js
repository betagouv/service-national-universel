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

module.exports = {
  serializeApplication,
};
