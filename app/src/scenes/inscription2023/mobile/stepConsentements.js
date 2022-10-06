import React from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import CheckBox from "../../../components/inscription/CheckBox";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib";
import EditPenLight from "../../../assets/icons/EditPenLight";
import StickyButton from "../../../components/inscription/stickyButton";

export default function StepConsentements() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState({
    consentment1: young.consentment === "true",
    consentment2: young.consentment === "true",
  });
  console.log(young);
  const onSubmit = async () => {
    // TODO
    setLoading(true);
    history.push("/inscription2023/representant");
    setLoading(false);
  };

  React.useEffect(() => {
    if (data.consentment1 && data.consentment2) setDisabled(false);
    else setDisabled(true);
  }, [data]);

  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <div className="w-full flex justify-between items-center mt-2">
          <h1 className="text-xl font-bold">Apporter mon consentement</h1>
          <Link to="/public-besoin-d-aide/">
            <QuestionMarkBlueCircle />
          </Link>
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col gap-4 mt-4 pb-2">
          <div className="text-[#161616] text-base">
            Je,{" "}
            <strong>
              {young.firstName} {young.lastName}
            </strong>
            ,
          </div>
          <div className="flex items-center gap-4">
            <CheckBox checked={data.consentment1} onChange={(e) => setData({ ...data, consentment1: e })} />
            <div className="text-[#3A3A3A] text-sm flex-1">
              Suis volontaire pour effectuer la session 2023 du Service National Universel qui comprend la participation au séjour de cohésion{" "}
              <strong>{COHESION_STAY_LIMIT_DATE[young.cohort]}</strong> puis la réalisation d’une mission d’intérêt général.
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CheckBox checked={data.consentment2} onChange={(e) => setData({ ...data, consentment2: e })} />
            <div className="text-[#3A3A3A] text-sm flex-1">M&apos;engage à respecter le règlement intérieur du SNU, en vue de ma participation au séjour de cohésion.</div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mt-4 pb-4">
          <EditPenLight />
          <div className="text-[#000091] text-sm font-medium">Je souhaite modifier mes dates de séjour</div>
        </div>
      </div>
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/coordonnee")} onClick={onSubmit} disabled={disabled || loading} />
    </>
  );
}
