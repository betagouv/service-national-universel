import React, { useEffect, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi";
import RulesDetail from "./../RulesDetail";
import { ModalContainer } from "../../../../components/modals/Modal";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../assets/Close";
import { HiBell } from "react-icons/hi";

export default function StepRules({ young }) {
  const [stateDesktop, setStateDesktop] = useState(false);
  const [stateMobil, setStateMobil] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (young) {
      setValid(young.rulesYoung === "true");
    }
  }, [young]);

  //Id = 1 --> step rules we can see it even if it's already accepted
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-row items-center justify-between  cursor-pointer" onClick={() => setStateDesktop(!stateDesktop)}>
        <div className="flex flex-1 flex-row py-4 items-center">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : stateDesktop ? (
            <div className="flex items-center justify-center h-9 w-9 rounded-full mr-4 border-[1px] border-gray-200 text-gray-700">1</div>
          ) : (
            <div className="flex items-center justify-center bg-orange-500 h-9 w-9 rounded-full mr-3">
              <HiBell className="flex w-5 h-5 text-white rounded-full" />
            </div>
          )}
          <div className="flex flex-1 flex-col mx-3">
            <h1 className="text-base leading-7 text-gray-900">Acceptez le Règlement Intérieur</h1>
            <p className="text-sm leading-5 text-gray-500">Vous devez lire et accepter le Règlement Intérieur avant votre départ en séjour.</p>
          </div>
        </div>

        {stateDesktop ? (
          <div className="flex items-center justify-center bg-gray-100 h-9 w-9 rounded-full hover:scale-110">
            <HiOutlineChevronDown className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-100 h-9 w-9 rounded-full hover:scale-110">
            <HiOutlineChevronUp className="h-5 w-5" />
          </div>
        )}
      </div>
      {/* Mobile */}
      <div
        className={`md:hidden flex items-center border-[1px] mb-3 ml-4 rounded-xl h-36 cursor-pointer ${valid ? "border-green-500 bg-green-50" : "bg-white"} `}
        onClick={() => setStateMobil(!stateMobil)}>
        <div className="-translate-x-5 flex flex-row items-center w-full">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full border-[1px] bg-white border-gray-200 text-gray-700">1</div>
          )}
          <div className="flex flex-1 flex-col ml-3">
            <div className={`text-sm ${valid && "text-green-600"} text-gray-900`}>Acceptez le Règlement Intérieur</div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} text-gray-500`}>
              Vous devez lire et accepter le Règlement Intérieur avant votre départ en séjour.
            </div>
            <div className={` text-sm text-right leading-5 ${valid ? "text-green-500" : "text-blue-600"}`}>{!valid ? "Commencer" : "Voir"}</div>
          </div>
        </div>
      </div>
      {/* View */}
      {stateDesktop ? <RulesDetail young={young} show={stateDesktop} setShowStep={setStateDesktop} /> : null}
      {stateMobil ? (
        <Modal centered isOpen={stateMobil} toggle={() => setStateMobil(false)} size="xl">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={() => setStateMobil(false)} />
            <div className="w-full p-4">
              <h1 className="text-gray-900 text-xl text-center pb-1">Acceptez le Règlement Intérieur</h1>
              <RulesDetail young={young} show={stateMobil} setShowStep={setStateMobil} />
            </div>
          </ModalContainer>
        </Modal>
      ) : null}
    </>
  );
}
