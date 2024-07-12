import { STATUS_CLASSE, YOUNG_STATUS, SENDINBLUE_TEMPLATES } from "snu-lib";
import ClasseModel from "../../models/cle/classe";
import CohortModel from "../../models/cohort";
import emailsEmitter from "../../emails";
import { ClasseDto } from "snu-lib/src/dto";

interface IClasseStateManager {
  compute: (_id: string, fromUser: any, options: { YoungModel?: any }) => Promise<ClasseDto>;
  withdraw: (_id: string, fromUser: any, options: { YoungModel?: any }) => Promise<ClasseDto>;
}

const ClasseStateManager: IClasseStateManager = {
  compute: async (_id, fromUser, options): Promise<ClasseDto> => {
    const YoungModel = options?.YoungModel; // Prevent circular dependency in YoungModel post save hook
    if (!YoungModel) throw new Error("YoungModel is required");

    let classe = await ClasseModel.findById(_id);
    if (!classe) throw new Error("Classe not found");
    if (classe.status === STATUS_CLASSE.WITHDRAWN) return classe;

    // Get cohort
    const classeCohort = await CohortModel.findOne({ name: classe.cohort });
    if (!classeCohort) throw new Error("Cohort not found");

    // Get students
    const students = await YoungModel.find({ classeId: classe._id }).lean();
    const studentValidated = students.filter((student) => student.status === YOUNG_STATUS.VALIDATED);
    const seatsValidated = studentValidated.length;
    classe.set({ seatsTaken: seatsValidated });

    // Get inscription date
    const now = new Date();
    const inscriptionStartDate = new Date(classeCohort.inscriptionStartDate);
    const inscriptionEndDate = new Date(classeCohort.inscriptionEndDate);
    const isInscriptionOpen = now >= inscriptionStartDate && now <= inscriptionEndDate;
    const isInscriptionClosed = now >= inscriptionEndDate;

    // Open
    if ([STATUS_CLASSE.ASSIGNED, STATUS_CLASSE.CLOSED].includes(classe.status) && isInscriptionOpen) {
      classe.set({ status: STATUS_CLASSE.OPEN });
      classe = await classe.save({ fromUser });
      return classe;
    }

    // Closed
    if ((classe.status !== STATUS_CLASSE.CLOSED && isInscriptionClosed) || classe.totalSeats === seatsValidated) {
      classe.set({ status: STATUS_CLASSE.CLOSED });
      classe = await classe.save({ fromUser });
      return classe;
    }

    await classe.save({ fromUser });

    return classe;
  },

  withdraw: async (_id, fromUser, options): Promise<ClasseDto> => {
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
