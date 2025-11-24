import React, { useState } from "react";
import Badge from "../../../../components/Badge";
import { ROLES, YOUNG_STATUS_COLORS, translatePhase1 } from "snu-lib";
import ModalDispense from "../ModalDispense";
import ModalConfirm from "../../../../components/modals/ModalConfirm";

const Phase1Header = ({ young = null, setYoung, user }) => {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalDispense, setModalDispense] = useState({ isOpen: false });

  return (
    <>
      <div className="mb-6 flex justify-between">
        <div className="flex items-center gap-2">
          <p className="text-2xl leading-7 font-bold">Séjour de cohésion</p>
          <Badge minify text={translatePhase1(young.statusPhase1)} color={YOUNG_STATUS_COLORS[young.statusPhase1]} />
        </div>
        <div className="flex items-center gap-2">
          {young.statusPhase1 === "NOT_DONE" && user.role === ROLES.ADMIN && (
            <div onClick={() => setModalDispense({ isOpen: true })} className="ml-2 cursor-pointer rounded border-[1px] border-blue-700 px-2.5 py-1.5 font-medium text-blue-700">
              Dispenser le volontaire du séjour
            </div>
          )}
        </div>
      </div>
      <ModalConfirm isOpen={modal?.isOpen} title={modal?.title} message={modal?.message} onCancel={() => setModal({ isOpen: false })} onConfirm={modal?.onConfirm} />
      <ModalDispense
        isOpen={modalDispense?.isOpen}
        youngId={young?._id}
        onCancel={() => setModalDispense({ isOpen: false })}
        onSuccess={(young) => {
          setModalDispense({ isOpen: false });
          setYoung(young);
        }}
      />
    </>
  );
};

export default Phase1Header;
