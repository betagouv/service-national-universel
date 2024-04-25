export const ACTION_DELETE_ACCOUNT = "deleteAccount";
export const ACTION_ABANDON = "abandon";
export const ACTION_WITHDRAW = "withdraw";

export const CONTENT_FORM = "form";
export const CONTENT_CONFIRM = "confirm";
export const CONTENT_CHANGE_DATE = "changeDate";

export const steps = {
  [ACTION_WITHDRAW]: [
    {
      content: CONTENT_CHANGE_DATE,
      title: "Voulez-vous vraiment vous désister ?",
      subTitle: "Vous pouvez aussi simplement changer vos dates de séjour.",
      confirmButtonName: "Je souhaite me désister",
    },
    { content: CONTENT_FORM, title: "Se désister du SNU", subTitle: "Veuillez précisez la raison de votre désistement.", confirmButtonName: "Me désister" },
    {
      content: CONTENT_CONFIRM,
      title: "Êtes-vous sûr(e) ?",
      subTitle: "Vous vous apprêtez à quitter votre parcours SNU. Cette action est irréversible, souhaitez-vous confirmer cette action ?",
    },
  ],
  [ACTION_ABANDON]: [
    {
      content: CONTENT_CHANGE_DATE,
      title: "Voulez-vous vraiment abandonner votre inscription ?",
      subTitle: "Vous pouvez aussi simplement changer vos dates de séjour.",
      confirmButtonName: "Je souhaite abandonner",
    },
    { content: CONTENT_FORM, title: "Abandonner mon inscription", subTitle: "Veuillez précisez la raison de votre abandon.", confirmButtonName: "Abandonner" },
    {
      content: CONTENT_CONFIRM,
      title: "Êtes-vous sûr(e) ?",
      subTitle: "Vous vous apprêtez à abandonner votre inscription au SNU. Cette action est irréversible, souhaitez-vous confirmer cette action ?",
    },
  ],
};
