import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getCohortPeriod, getCohortYear } from "snu-lib";
import { getCohort } from "@/utils/cohorts";
import Error from "../../../components/error";
import CheckBox from "../../../components/dsfr/forms/checkbox";
import { supportURL } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import Navbar from "../components/Navbar";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";

export default function StepConsentements() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const dispatch = useDispatch();
  const [data, setData] = React.useState({
    consentment1: young?.consentment === "true",
    consentment2: young?.acceptCGU === "true",
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/consentement`, data);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      plausibleEvent("Phase0/CTA inscription - consentement");
      history.push("/inscription2023/representants");
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
    }

    setLoading(false);
  };

  React.useEffect(() => {
    if (data.consentment1 && data.consentment2) setDisabled(false);
    else setDisabled(true);
  }, [data]);

  return (
    <>
      <Navbar />
      <DSFRContainer title="Apporter mon consentement" supportLink={`${supportURL}/base-de-connaissance/je-minscris-et-donne-mon-consentement`}>
        {error?.text && <Error {...error} onClose={() => setError({})} />}
        <div className="mt-4 flex flex-col gap-4 pb-2">
          <div className="text-base text-[#161616]">
            Je,{" "}
            <strong>
              {young.firstName} {young.lastName}
            </strong>
            ,
          </div>
          <div className="flex items-center gap-4">
            <CheckBox checked={data.consentment1} onChange={(e) => setData({ ...data, consentment1: e })} />
            <div className="flex-1 text-sm text-[#3A3A3A]">
              Me porte volontaire pour participer à la session <strong>{getCohortYear(getCohort(young.cohort))}</strong> du Service National Universel qui comprend la participation
              à un séjour de cohésion puis la réalisation d&apos;une mission d&apos;intérêt général dans l&apos;année qui suit le séjour de cohésion.
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CheckBox checked={data.consentment2} onChange={(e) => setData({ ...data, consentment2: e })} />
            <div className="flex-1 text-sm text-[#3A3A3A]">
              M&apos;inscris pour le séjour de cohésion <strong>{getCohortPeriod(getCohort(young.cohort))}</strong> sous réserve de places disponibles et m&apos;engage à en
              respecter le{" "}
              <a
                href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/snu-reglement-interieur.pdf"
                target="_blank"
                rel="noreferrer"
                className="underline hover:underline">
                règlement intérieur
              </a>
              .
            </div>
          </div>
        </div>
        <SignupButtonContainer onClickNext={onSubmit} onClickPrevious={() => history.push("/inscription2023/coordonnee")} disabled={disabled || loading} />
      </DSFRContainer>
    </>
  );
}
