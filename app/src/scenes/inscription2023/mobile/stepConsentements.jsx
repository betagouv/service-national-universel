import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Error from "../../../components/error";
import Footer from "@/components/dsfr/layout/Footer";
import CheckBox from "../../../components/inscription/checkbox";
import StickyButton from "../../../components/inscription/stickyButton";
import { supportURL } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
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
      <div className="bg-white p-4 text-[#161616]">
        <div className="mt-2 flex w-full items-center justify-between">
          <h1 className="text-xl font-bold">Apporter mon consentement</h1>
          <a href={`${supportURL}/base-de-connaissance/je-minscris-et-donne-mon-consentement`} target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <hr className="my-4 h-px border-0 bg-gray-200" />
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
        {/* <div className="mt-4 flex items-center justify-end gap-2 pb-4" onClick={() => setModal({ isOpen: true })}>
          <EditPenLight />
          <div className="text-sm font-medium text-[#000091]">Je souhaite modifier mes dates de séjour</div>
        </div> */}
      </div>
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/coordonnee")} onClick={onSubmit} disabled={disabled || loading} />
      {/* <ModalSejour isOpen={modal.isOpen} onCancel={() => setModal({ isOpen: false })} /> */}
    </>
  );
}
