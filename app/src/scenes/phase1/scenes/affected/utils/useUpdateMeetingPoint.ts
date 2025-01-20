import { useMutation } from "@tanstack/react-query";
import { updateMeetingPoint } from "./affectationRepository";
import useAuth from "@/services/useAuth";
import { useDispatch } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { queryClient } from "@/services/react-query";

export default function useUpdateMeetingPoint() {
  const { young } = useAuth();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (choice) => updateMeetingPoint(young._id, choice),
    onSuccess: (data) => {
      dispatch(setYoung(data));
      queryClient.invalidateQueries({ queryKey: ["meetingPoint"] });
    },
  });
}
