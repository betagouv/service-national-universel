import React from "react";
import { useSelector } from "react-redux";
import { Modal } from "reactstrap";
import CloseSvg from "../../assets/Close";
import { ModalContainer } from "../../components/modals/Modal";
import { Logo, SuccessMessage } from "./components/printable";
import RulesDetail from "./components/RulesDetail";

export default function Rules({ isOpen, onCancel, correction }) {
  const young = useSelector((state) => state.Auth.young);

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onCancel} size="xl">
        <ModalContainer>
          <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
          <div className="w-full py-8 px-8 lg:px-20" id="imageRight">
            <h2 className="mt-0 text-center mb-2">Acceptez le Règlement Intérieur</h2>
            {young.rulesYoung === "true" ? (
              <>
                <SuccessMessage>
                  <Logo>
                    <svg height={64} width={64} fill="none" viewBox="0 0 24 24" stroke="#057a55" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </Logo>
                  Vous avez accepté le réglement intérieur.
                </SuccessMessage>
              </>
            ) : null}
            <RulesDetail young={young} />
          </div>
        </ModalContainer>
      </Modal>
    </>
  );
}
