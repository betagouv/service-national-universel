import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";
import { setYoung } from "@/redux/auth/actions";
import API from "@/services/api";
import { toastr } from "react-redux-toastr";
import EngagementPrograms from "@/scenes/preinscription/components/EngagementPrograms";
import { ReinscriptionContext } from "@/context/ReinscriptionContextProvider";

export default function NonEligible() {
  const [data] = React.useContext(ReinscriptionContext);
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

  return (
    <>
      <ProgressBar />
      <DSFRContainer
        supportLink={supportURL + "/base-de-connaissance/jetais-inscrit-en-2023-comment-me-reinscrire-en-2024"}
        title="Nous n'avons pas trouvé de séjour qui correspond à votre situation.">
        {data?.message === "age" && (
          <p className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">
            Pour participer au SNU, vous devez avoir <strong>entre 15 et 17 ans</strong>.
          </p>
        )}

        <EngagementPrograms />
        <SignupButtonContainer onClickNext={onClickButton} labelNext="Revenir à l'accueil" disabled={loading} />
      </DSFRContainer>
    </>
  );
}
