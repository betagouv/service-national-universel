import { useState } from "react";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";

export function usePendingAction() {
  const [isPendingAction, setIsPendingAction] = useState(false);
  const handlePendingAction = (action, pendingMessage, successMessage, errorMessage) => {
    setIsPendingAction(true);
    toastr.info(pendingMessage, { timeOut: 5000 });
    action
      .then(() => {
        toastr.clean();
        toastr.success(successMessage, { timeOut: 2000 });
      })
      .catch((error) => {
        toastr.clean();
        if (errorMessage instanceof String) {
          toastr.warning(errorMessage, { timeOut: 2000 });
        } else {
          toastr.warning(errorMessage(error), { timeOut: 2000 });
        }
        capture(error);
      })
      .finally(() => {
        setIsPendingAction(false);
      });
  };

  return {
    isPendingAction,
    handlePendingAction,
  };
}
