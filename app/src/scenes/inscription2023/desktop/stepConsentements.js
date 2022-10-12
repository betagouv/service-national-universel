import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib";
import EditPenLight from "../../../assets/icons/EditPenLight";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Error from "../../../components/error";
import CheckBox from "../../../components/inscription/CheckBox";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
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
    consentment2: young?.consentment === "true",
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
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
          <div className="w-full flex justify-between items-center mt-2">
            <h1 className="text-xl font-bold">Apporter mon consentement</h1>
            <Link to="/public-besoin-d-aide/">
              <QuestionMarkBlueCircle />
            </Link>
          </div>
          <hr className="my-8 h-px bg-gray-200 border-0" />
          {error?.text && <Error {...error} onClose={() => setError({})} />}
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
                <strong>{COHESION_STAY_LIMIT_DATE[young.cohort]}</strong> et la réalisation d’une mission d’intérêt général.
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CheckBox checked={data.consentment2} onChange={(e) => setData({ ...data, consentment2: e })} />
              <div className="text-[#3A3A3A] text-sm flex-1">
                M&apos;engage à respecter le{" "}
                <a href="https://drive.google.com/file/d/17T9zkm7gm5hdsazM5YkkOYwkNe1xvpdc/view" target="_blank" rel="noreferrer">
                  règlement intérieur
                </a>{" "}
                du SNU, en vue de ma participation au séjour de cohésion.
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center gap-2 mt-4 pb-4 cursor-pointer" onClick={() => setModal({ isOpen: true })}>
            <EditPenLight />
            <div className="text-[#000091] text-sm font-medium ">Je souhaite modifier mes dates de séjour</div>
          </div>
          <hr className="my-8 h-px bg-gray-200 border-0" />
          <div className="flex justify-end gap-4">
            <button
              className="flex items-center justify-center px-3 py-2 border-[1px] border-[#000091] text-[#000091] hover:text-white hover:bg-[#000091]"
              onClick={() => history.push("/inscription2023/coordonnee")}>
              Précédent
            </button>
            <button
              disabled={disabled || loading}
              className="flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white hover:!text-[#000091] hover:bg-white hover:border hover:border-[#000091]  disabled:bg-[#E5E5E5] disabled:!text-[#929292] disabled:border-0 disabled:cursor-default"
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
