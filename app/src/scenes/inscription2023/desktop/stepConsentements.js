import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib";
import EditPenLight from "../../../assets/icons/EditPenLight";
import Error from "../../../components/error";
import CheckBox from "../../../components/inscription/checkbox";
import { supportURL } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import DesktopPageContainer from "../components/DesktopPageContainer";
import ModalSejour from "../components/ModalSejour";

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
    // TODO
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
    <DesktopPageContainer
      title="Apporter mon consentement"
      onSubmit={onSubmit}
      onClickPrevious={() => history.push("/inscription2023/coordonnee")}
      disabled={disabled || loading}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-donne-mon-consentement`}>
      {error?.text && <Error {...error} onClose={() => setError({})} />}
      <div className="text-[#161616] text-base">
        Je,{" "}
        <strong>
          {young.firstName} {young.lastName}
        </strong>
        ,
      </div>
      <div className="flex items-center gap-4 my-4">
        <CheckBox checked={data.consentment1} onChange={(e) => setData({ ...data, consentment1: e })} />
        <div className="text-[#3A3A3A] text-sm flex-1">
          Suis volontaire pour effectuer la session 2023 du Service National Universel qui comprend la participation au séjour de cohésion{" "}
          <strong>{COHESION_STAY_LIMIT_DATE[young.cohort]}</strong> et la réalisation d’une mission d’intérêt général.
        </div>
      </div>
      <div className="flex items-center gap-4 my-4">
        <CheckBox checked={data.consentment2} onChange={(e) => setData({ ...data, consentment2: e })} />
        <div className="text-[#3A3A3A] text-sm flex-1">
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
      <div className="flex justify-end items-center gap-2 my-4 cursor-pointer" onClick={() => setModal({ isOpen: true })}>
        <EditPenLight />
        <div className="text-[#000091] text-sm font-medium ">Je souhaite modifier mes dates de séjour</div>
      </div>
      <ModalSejour isOpen={modal.isOpen} onCancel={() => setModal({ isOpen: false })} />
    </DesktopPageContainer>
  );
}
