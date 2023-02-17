import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { translate } from "snu-lib";
import { setYoung } from "../../redux/auth/actions";
import { capture } from "../../sentry";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import DesktopConfirm from "./desktop/stepConfirm";
import MobileConfirm from "./mobile/stepConfirm";

export default function StepConfirm({ device }) {
  const young = useSelector((state) => state.Auth.young);
  const [hasHandicap, setHasHandicap] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (
      young.handicap ||
      young.allergies ||
      young.ppsBeneficiary ||
      young.paiBeneficiary ||
      young.specificAmenagment ||
      young.reducedMobilityAccess ||
      young.handicapInSameDepartment ||
      young.highSkilledActivity ||
      young.highSkilledActivityInSameDepartment
    ) {
      setHasHandicap(true);
    }
  }, []);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/confirm`);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      plausibleEvent("Phase0/CTA inscription - valider inscription");
      history.push("/inscription2023/done");
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
    }
    setLoading(false);
  };

  return device === "mobile" ? (
    <MobileConfirm hasHandicap={hasHandicap} loading={loading} error={error} setError={setError} onSubmit={onSubmit} />
  ) : (
    <DesktopConfirm hasHandicap={hasHandicap} loading={loading} error={error} setError={setError} onSubmit={onSubmit} />
  );
}
