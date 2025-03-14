import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const updateEmailModal = createModal({
  id: "update-email-adress",
  isOpenedByDefault: false,
});

export const emailValidationNoticeModal = createModal({
  id: "email-validation-notice",
  isOpenedByDefault: false,
});

export const alreadyHaveAnAccountModal = createModal({
  id: "already-have-an-account",
  isOpenedByDefault: false,
});
