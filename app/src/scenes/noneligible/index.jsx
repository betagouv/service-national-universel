import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { Redirect } from "react-router-dom";
import { useHistory } from "react-router-dom";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import EngagementPrograms from "@/scenes/preinscription/components/EngagementPrograms";
import { YOUNG_STATUS } from "snu-lib";
import API from "@/services/api";
import dayjs from "dayjs";
import { SignupButtons } from "@snu/ds/dsfr";

export default function NonEligible() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onClickButton = async () => {
    setLoading(true);
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  const young = useSelector((state) => state.Auth.young);
  if (young?.status !== YOUNG_STATUS.NOT_ELIGIBLE) return <Redirect to={{ pathname: "/" }} />;

  // Check if user is older than 17
  const age = dayjs().diff(dayjs(young.birthdateAt), "year");

  return (
    <DSFRLayout>
      <DSFRContainer title="Vous n’êtes malheureusement pas éligible au SNU.">
        {age > 17 && (
          <p className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">
            Pour participer au SNU, vous devez avoir <strong>entre 15 et 17 ans</strong>.
          </p>
        )}
        <EngagementPrograms />
        <SignupButtons onClickNext={onClickButton} labelNext="Revenir à l'accueil" disabled={loading} />
      </DSFRContainer>
    </DSFRLayout>
  );
}
