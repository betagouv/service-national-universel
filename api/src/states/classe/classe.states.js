const { STATUS_CLASSE } = require('snu-lib')

const StateMachine = require('../StateMachine')

class Machine extends StateMachine {
  constructor(classe) {
    super(classe, {
      initialState: STATUS_CLASSE.DRAFT,
      states: {
        // Lorsque la création de la classe a été initiée (par exemple par le chef d’établissement) et qu’elle doit être finalisée
        [STATUS_CLASSE.DRAFT]: {
          next: STATUS_CLASSE.CREATED,
          isSatisfied: () => true,
        },

        //  Lorsque que le référent de classe à compléter les informations de la classe mais 0 inscrits
        [STATUS_CLASSE.CREATED]: {
          next: STATUS_CLASSE.INSCRIPTION_IN_PROGRESS,
          isSatisfied: () => this.classe.status === STATUS_CLASSE.DRAFT,
        },

        // Dès la première inscription d’un volontaire. (au moins 1 élève n’est pas inscrit - (en cours d’inscription, en attente de correction))
        [STATUS_CLASSE.INSCRIPTION_IN_PROGRESS]: {
          next: STATUS_CLASSE.INSCRIPTION_TO_CHECK,
          isSatisfied: () => false,
        },

        // Tous les élèves sont inscrits mais les dossiers ne sont pas validés. (au moins 1 qui n’est pas validé)
        [STATUS_CLASSE.INSCRIPTION_TO_CHECK]: {
          next: STATUS_CLASSE.DONE,
          isSatisfied: () => false,
        },

        // Tous les élèves sont inscrits et les dossiers sont validés
        [STATUS_CLASSE.DONE]: {
          isSatisfied: () => false,
        },

        // Lorsqu’une classe est désisté (par le chef d’établissement et coordinateur CLE) les volontaires passent automatiquement en “inscription abandonnée”
        [STATUS_CLASSE.WITHDRAWN]: {
          isSatisfied: () => false,
        },
      }
    })
  }
}

module.exports = Machine;
