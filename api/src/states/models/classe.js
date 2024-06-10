const Joi = require("joi");
const { STATUS_CLASSE, YOUNG_STATUS, CLE_COLORATION_LIST, CLE_FILIERE_LIST, CLE_GRADE_LIST, SENDINBLUE_TEMPLATES } = require("snu-lib");
const ClasseModel = require("../../models/cle/classe");
const emailsEmitter = require("../../emails");

const ClasseStateManager = {};

ClasseStateManager.compute = async (_id, fromUser, options) => {
  const YoungModel = options?.YoungModel; // Prevent circular dependency in YoungModel post save hook
  if (!YoungModel) throw new Error("YoungModel is required");

  let classe = await ClasseModel.findById(_id);
  if (!classe) throw new Error("Classe not found");
  if (classe.status === STATUS_CLASSE.WITHDRAWN) return classe;

  // Draft
  const { error: isDraft } = Joi.object({
    name: Joi.string().required(),
    totalSeats: Joi.number().required(),
    coloration: Joi.string()
      .valid(...CLE_COLORATION_LIST)
      .required(),
    filiere: Joi.string()
      .valid(...CLE_FILIERE_LIST)
      .required(),
    grade: Joi.string()
      .valid(...CLE_GRADE_LIST)
      .required(),
  }).validate(classe, { stripUnknown: true });
  if (classe.status != STATUS_CLASSE.DRAFT && (isDraft || classe.totalSeats === 0)) {
    classe.set({ status: STATUS_CLASSE.DRAFT });
    return await classe.save({ fromUser });
  }

  // Get students
  const students = await YoungModel.find({ classeId: classe._id }).lean();
  const studentInProgress = students.filter((student) => student.status === YOUNG_STATUS.IN_PROGRESS || student.status === YOUNG_STATUS.WAITING_CORRECTION);
  const studentWaiting = students.filter((student) => student.status === YOUNG_STATUS.WAITING_VALIDATION);
  const studentValidated = students.filter((student) => student.status === YOUNG_STATUS.VALIDATED);

  const seatsInProgress = studentInProgress.length + studentWaiting.length + studentValidated.length;

  const seatsTaken = studentValidated.length;
  classe.set({ seatsTaken });

  // Created
  if (classe.status != STATUS_CLASSE.CREATED && students.length === 0) {
    classe.set({ seatsTaken: 0, status: STATUS_CLASSE.CREATED });
    return await classe.save({ fromUser });
  }

  // Inscription in progress
  if (classe.status != STATUS_CLASSE.INSCRIPTION_IN_PROGRESS && classe.totalSeats > seatsInProgress) {
    classe.set({ status: STATUS_CLASSE.INSCRIPTION_IN_PROGRESS });
    return await classe.save({ fromUser });
  }

  // Inscription to check
  if (classe.status != STATUS_CLASSE.INSCRIPTION_TO_CHECK && classe.totalSeats <= seatsInProgress && studentInProgress.length === 0 && studentWaiting.length > 0) {
    classe.set({ status: STATUS_CLASSE.INSCRIPTION_TO_CHECK });
    return await classe.save({ fromUser });
  }

  // Validated
  if (classe.status != STATUS_CLASSE.VALIDATED && classe.totalSeats <= seatsTaken) {
    classe.set({ seatsTaken: seatsTaken, status: STATUS_CLASSE.VALIDATED });
    classe = await classe.save({ fromUser });

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_VALIDATED, classe);
    return classe;
  }

  await classe.save({ fromUser });

  return classe;
};

ClasseStateManager.withdraw = async (_id, fromUser, options) => {
  const YoungModel = options?.YoungModel; // Prevent circular dependency in YoungModel post save hook
  if (!YoungModel) throw new Error("YoungModel is required");

  let classe = await ClasseModel.findById(_id);
  if (!classe) throw new Error("Classe not found");
  if (classe.status === STATUS_CLASSE.WITHDRAWN) throw new Error("Classe already withdrawn");

  // Withdraw classe
  classe.set({ status: STATUS_CLASSE.WITHDRAWN });
  classe = await classe.save({ fromUser });

  // Set all students in "Inscription abandonnée"
  const students = await YoungModel.find({
    classeId: classe._id,
    status: { $in: [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.VALIDATED] },
  });
  await Promise.all(
    students.map((s) => {
      s.set({
        status: YOUNG_STATUS.ABANDONED,
        lastStatusAt: Date.now(),
        withdrawnMessage: "classe désistée",
        withdrawnReason: "other",
      });
      return s.save({ fromUser });
    }),
  );

  return classe;
};

module.exports = ClasseStateManager;
