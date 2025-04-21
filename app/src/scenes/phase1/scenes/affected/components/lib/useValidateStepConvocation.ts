import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { validateStepConvocation } from "./repository";
import { setYoung } from "@/redux/auth/actions";
import { toastr } from "react-redux-toastr";

export function useValidateStepConvocation() {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: validateStepConvocation,
    onSuccess: (data) => {
      dispatch(setYoung(data));
      toastr.success("L'étape de convocation a bien été validée", "");
    },
  });
}
