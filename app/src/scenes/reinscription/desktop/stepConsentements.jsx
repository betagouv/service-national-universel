import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib";
import EditPenLight from "../../../assets/icons/EditPenLight";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Error from "../../../components/error";
import CheckBox from "../../../components/inscription/checkbox";
import { supportURL } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import ModalSejour from "../components/ModalSejour";
import Navbar from "../components/Navbar";

export default function StepConsentements() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const [modal, setModal] = React.useState({ isOpen: false });
  const dispatch = useDispatch();
  const [data, setData] = React.useState({
    consentment1: young?.consentment === "true",
    consentment2: young?.acceptCGU === "true",
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { ok, code, data: responseData } = await api.put(`/young/reinscription/consentement`, data);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      plausibleEvent("Phase0/CTA reinscription - consentement");
      history.push("/reinscription/documents");
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
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px]">
          <div className="mt-2 flex w-full items-center justify-between">
            <h1 className="text-xl font-bold">Apporter mon consentement</h1>
            <a href={`${supportURL}/base-de-connaissance/je-minscris-et-donne-mon-consentement`} target="_blank" rel="noreferrer">
              <QuestionMarkBlueCircle />
            </a>
          </div>
          <hr className="my-8 h-px border-0 bg-gray-200" />
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
                Suis volontaire pour effectuer la session 2023 du Service National Universel qui comprend la participation au séjour de cohésion{" "}
                <strong>{COHESION_STAY_LIMIT_DATE[young.cohort]}</strong> et la réalisation d’une mission d’intérêt général.
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CheckBox checked={data.consentment2} onChange={(e) => setData({ ...data, consentment2: e })} />
              <div className="flex-1 text-sm text-[#3A3A3A]">
                M&apos;engage à respecter le{" "}
                <a
                  href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/snu-reglement-interieur-2022-2023.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:underline">
                  règlement intérieur
                </a>{" "}
                du SNU, en vue de ma participation au séjour de cohésion.
              </div>
            </div>
          </div>
          <div className="mt-4 flex cursor-pointer items-center justify-end gap-2 pb-4" onClick={() => setModal({ isOpen: true })}>
            <EditPenLight />
            <div className="text-sm font-medium text-[#000091] ">Je souhaite modifier mes dates de séjour</div>
          </div>
          <hr className="my-8 h-px border-0 bg-gray-200" />
          <div className="flex justify-end gap-4">
            <button
              className="flex items-center justify-center border-[1px] border-[#000091] px-3 py-2 text-[#000091] hover:bg-[#000091] hover:text-white"
              onClick={() => history.push("/reinscription/eligibilite")}>
              Précédent
            </button>
            <button
              disabled={disabled || loading}
              className="flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]  disabled:cursor-default disabled:border-0 disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
              onClick={() => (!loading || !disabled) && onSubmit()}>
              Continuer
            </button>
          </div>
        </div>
      </div>
      <ModalSejour isOpen={modal.isOpen} onCancel={() => setModal({ isOpen: false })} />
    </>
  );
}
