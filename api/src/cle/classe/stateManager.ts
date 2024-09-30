import { STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";
import { ClasseModel, CohortModel } from "../../models";
import { isCohortInscriptionClosed, isCohortInscriptionOpen } from "../../cohort/cohortService";

const ClasseStateManager = {
  compute: async (_id, fromUser, options) => {
    const YoungModel = options?.YoungModel; // Prevent circular dependency in YoungModel post save hook
    if (!YoungModel) throw new Error("YoungModel is required");

    let classe = await ClasseModel.findById(_id);
    if (!classe) throw new Error("Classe not found");
    if (classe.status === STATUS_CLASSE.WITHDRAWN) return classe;

    // Get cohort
    const classeCohort = await CohortModel.findById(classe.cohortId);
    if (!classeCohort) throw new Error("Cohort not found");

    // Get students
    const students = await YoungModel.find({ classeId: classe._id }).lean();
    const studentValidated = students.filter((student) => student.status === YOUNG_STATUS.VALIDATED);
    const seatsValidated = studentValidated.length;
    classe.set({ seatsTaken: seatsValidated });

    // Get inscription date
    const isInscriptionOpen = isCohortInscriptionOpen(classeCohort);
    const isInscriptionClosed = isCohortInscriptionClosed(classeCohort);

    // Open
    if ([STATUS_CLASSE.ASSIGNED, STATUS_CLASSE.CLOSED].includes(classe.status as any) && isInscriptionOpen) {
      classe.set({ status: STATUS_CLASSE.OPEN });
      classe = await classe.save({ fromUser });
      return classe;
    }

    // Closed
    if ((classe.status !== STATUS_CLASSE.CLOSED && isInscriptionClosed) || classe.totalSeats === seatsValidated || seatsValidated > classe.totalSeats) {
      classe.set({ status: STATUS_CLASSE.CLOSED });
      classe = await classe.save({ fromUser });
      return classe;
    }

    await classe.save({ fromUser });

    return classe;
  },

  withdraw: async (_id, fromUser, options) => {
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
  },
};

export default ClasseStateManager;
