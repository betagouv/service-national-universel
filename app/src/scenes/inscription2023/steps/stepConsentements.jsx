import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { getCohortPeriod, getCohortYear } from "snu-lib";
import { getCohort } from "@/utils/cohorts";
import Error from "../../../components/error";
import { knowledgebaseURL } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import { SignupButtons, Checkbox } from "@snu/ds/dsfr";
import useClass from "@/scenes/cle/useClass";
import Loader from "@/components/Loader";

export default function StepConsentements() {
  const { young, isCLE } = useAuth();
  const history = useHistory();
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const dispatch = useDispatch();
  const [data, setData] = React.useState({
    consentment1: young?.consentment === "true",
    consentment2: young?.acceptCGU === "true",
  });

  const { data: classe, isLoading } = useClass(young?.classeId);

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
      const eventName = isCLE ? "CLE/CTA inscription - consentement" : "Phase0/CTA inscription - consentement";
      plausibleEvent(eventName);
      history.push("/inscription/representants");
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

  if (isLoading) return <Loader />;

  const cohortYear = isCLE ? classe?.schoolYear : getCohortYear(getCohort(young.cohort));

  return (
    <>
      <DSFRContainer
        title="Apporter mon consentement"
        supportLink={`${knowledgebaseURL}${isCLE ? "/base-de-connaissance/cle-je-minscris-et-donne-mon-consentement" : "/base-de-connaissance/je-minscris-et-donne-mon-consentement"}`}
        supportEvent="Phase0/aide inscription - consentement">
        {error?.text && <Error {...error} onClose={() => setError({})} />}
        <div className="mt-4 flex flex-col gap-4 pb-2">
          <Checkbox
            legend={
              <div className="text-base text-[#161616]">
                Je,{" "}
                <strong>
                  {young.firstName} {young.lastName}
                </strong>
                ,
              </div>
            }
            options={[
              {
                label: (
                  <span>
                    Me porte volontaire pour participer à la session <strong>{cohortYear}</strong> du Service National Universel qui comprend la participation à un séjour de
                    cohésion puis la réalisation d'une phase d'engagement.
                  </span>
                ),
                nativeInputProps: {
                  checked: data.consentment1,
                  onChange: (e) => setData({ ...data, consentment1: e.target.checked }),
                },
              },
              {
                label: (
                  <span>
                    {isCLE ? (
                      <>M&apos;inscris au séjour de cohésion </>
                    ) : (
                      <>
                        M&apos;inscris au séjour de cohésion <strong>{getCohortPeriod(getCohort(young.cohort))}</strong> sous réserve de places disponibles{" "}
                      </>
                    )}
                    et m&apos;engage à en respecter le{" "}
                    <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/SNU-reglement-interieur.pdf" target="_blank" rel="noreferrer">
                      règlement intérieur
                    </a>
                    .
                  </span>
                ),
                nativeInputProps: {
                  checked: data.consentment2,
                  onChange: (e) => setData({ ...data, consentment2: e.target.checked }),
                },
              },
            ]}
          />
        </div>
        <SignupButtons onClickNext={onSubmit} onClickPrevious={() => history.push("/inscription/coordonnee")} disabled={disabled || loading} />
      </DSFRContainer>
    </>
  );
}
