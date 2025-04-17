import { setYoung } from "@/redux/auth/actions";
import { updateYoung } from "@/services/young.service";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { YoungType } from "snu-lib";

export default function useUpdateAccount(section: string) {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: (payload: Partial<YoungType>) => updateYoung(section, payload),
    onSuccess: ({ title, message, data }) => {
      toastr.success(title, message);
      dispatch(setYoung(data));
    },
    onError: (error) => {
      console.error(error);
      toastr.error("Une erreur s'est produite :", error.message);
    },
  });
}
