const { STATUS_PHASE1_CLASSE } = require('snu-lib')

const StateMachine = require('../StateMachine')

class Machine extends StateMachine {
  constructor(classe) {
    super(classe, {
      key: "statusPhase1",
      initialState: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION,
      states: {
        [STATUS_CLASSE.WAITING_AFFECTATION]: {
          next: STATUS_CLASSE.AFFECTED,
          isSatisfied: () => true,
        },
        [STATUS_CLASSE.AFFECTED]: {
          next: STATUS_CLASSE.DONE,
          isSatisfied: () => false,
        },
        [STATUS_CLASSE.DONE]: {
          isSatisfied: () => false,
        },
        [STATUS_CLASSE.NOT_DONE]: {
          isSatisfied: () => false,
        },
      }
    })
  }
}

module.exports = Machine;
