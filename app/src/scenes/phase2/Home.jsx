import React, { useState, useEffect } from "react";
import Img from "../../assets/homePhase2.png";
import api from "../../services/api";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import Equivalence from "./Equivalence";
import CardEquivalenceMobile from "./mobile/components/CardEquivalence";
import CardEquivalenceDesktop from "./desktop/components/CardEquivalence";
import { YOUNG_STATUS_PHASE2 } from "../../utils";

const CardEquivalence = (props) => (
  <>
    <div className="w-full hidden flex-1 md:flex">
      <CardEquivalenceDesktop {...props} />
    </div>
    <div className="w-full flex md:hidden ">
      <CardEquivalenceMobile {...props} />
    </div>
  </>
);

const WelcomeBlockValidated = ({ young }) => (
  <>
    <div className="text-[40px] font-medium leading-tight tracking-tight">
      <b>{young.firstName}</b>,
      <br />
      vous avez validé votre phase Engagement !
    </div>
    <div className="left-7 mt-5 text-[14px] text-gray-800">Bravo pour votre engagement.</div>
  </>
);

const WelcomeBlock = () => (
  <>
    <div className="text-[40px] font-medium leading-tight tracking-tight">
      Mon engagement,
      <br />
      <span className="text-blue-600"> Un temps au service de la Nation</span>
    </div>
    <div className="left-7 mt-5 text-[14px] text-gray-800">
      Engagez-vous selon vos préférences ! C&apos;est vous qui choisissez la cause que vous voulez soutenir à travers votre phase 2. Vous allez vous sentir pleinement utile à la
      société.
    </div>
  </>
);

export default function HomePhase2() {
  const young = useSelector((state) => state.Auth.young);
  const [equivalences, setEquivalences] = useState([]);
  const phase2Validated = young?.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;

  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, [young]);

  const history = useHistory();
  return (
    <>
      <div className="flex">
        <div className="md:my-12 md:mx-10 w-full">
          <div className="flex flex-col-reverse md:flex-row sm:py-4 sm:px-4 md:py-0 md:px-0 items-center justify-between rounded-lg bg-white ">
            <div className="md:w-1/2 md:py-12 md:pl-10">
              {phase2Validated && <WelcomeBlockValidated young={young} />}
              {!phase2Validated && <WelcomeBlock />}
              <div className="flex w-full flex-col md:flex-row items-stretch mt-5">
                <button
                  className="sm:mb-4 md:mb-0 rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                  onClick={() => {
                    plausibleEvent("Phase 2/CTA - Realiser ma mission");
                    history.push("phase2/mig");
                  }}>
                  {phase2Validated ? "Voir mes missions réalisées" : "Réaliser une mission d'intérêt général"}
                </button>
                <button
                  className="md:ml-4 rounded-[10px] border-[1px] border-blue-600  bg-white py-2.5 px-3 text-sm font-medium leading-5 text-blue-600 transition duration-150 ease-in-out hover:!bg-blue-600 hover:!text-white"
                  onClick={() => history.push("/autres-engagements")}>
                  Découvrir les autres engagements
                </button>
              </div>
            </div>
            <div className="md:w-1/3 md:pr-10">
              <img className="object-contain" src={Img} />
            </div>
          </div>

          <div className="flex flex-col items-center pt-8">
            {equivalences.map((equivalence, index) => (
              <CardEquivalence key={index} equivalence={equivalence} young={young} />
            ))}
          </div>
          <hr />
          {!phase2Validated && equivalences.length < 3 && equivalences.filter((equivalence) => equivalence.status !== "REFUSED").length === 0 && (
            <div className="md:m-8 mt-8 mb-8">
              <Equivalence />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
