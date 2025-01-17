import React, { useState } from "react";
import plausibleEvent from "../../../../../services/plausible";
import MedicalFileModal from "../../../components/MedicalFileModal";
import Arrow from "../assets/Arrow";
import DontForget from "../assets/DontForget";
import { ModalConvocation } from "./ModalConvocation";
import useAuth from "@/services/useAuth";
import useAffectationData from "../utils/useAffectationInfo";

export default function TodoBackpack() {
  const { isCLE } = useAuth();
  const { session, meetingPoint } = useAffectationData();
  const [modalConvocationOpen, setModalConvocationOpen] = useState(false);
  const [isMedicalFileModalOpen, setMedicalFileModalOpen] = useState(false);

  const persistedTodo = JSON.parse(localStorage.getItem("todo")) || {
    convocation: false,
    identite: false,
    sanitaire: false,
    masques: false,
    collation: false,
  };

  const [todo, setTodo] = useState(persistedTodo);

  function handleCheck(e) {
    setTodo({
      ...todo,
      [e.target.name]: e.target.checked,
    });
    if (Object.values(todo).filter((e) => e === true).length === 2) {
      plausibleEvent("Phase1/Sac a dos 2e case cochee");
    }
    localStorage.setItem("todo", JSON.stringify(todo));
  }

  return (
    <>
      <MedicalFileModal isOpen={isMedicalFileModalOpen} onClose={() => setMedicalFileModalOpen(false)} />
      <ModalConvocation open={modalConvocationOpen} setOpen={setModalConvocationOpen} />

      <div className="relative">
        <h1 className="mb-6 text-xl font-bold">A préparer...</h1>
        {!isCLE && (
          <>
            <div className="flex items-baseline gap-4">
              <input type="checkbox" name="convocation" id="convocation" checked={todo.convocation} onChange={handleCheck} />
              <label htmlFor="convocation">
                Votre{" "}
                <button onClick={() => setModalConvocationOpen(true)} className="h-6 font-semibold underline decoration-2 underline-offset-4">
                  convocation
                </button>
              </label>
            </div>

            <div className="flex items-baseline gap-4">
              <input type="checkbox" name="identite" id="identite" checked={todo.identite} onChange={handleCheck} />
              <label htmlFor="identite">
                Votre <strong>pièce d&apos;identité</strong>
              </label>
            </div>
          </>
        )}

        <div className="flex items-baseline gap-4">
          <input type="checkbox" name="sanitaire" id="sanitaire" checked={todo.sanitaire} onChange={handleCheck} />
          <label htmlFor="sanitaire">
            La{" "}
            <button onClick={() => setMedicalFileModalOpen(true)} className="h-6 font-semibold underline decoration-2 underline-offset-4">
              fiche sanitaire
            </button>{" "}
            {session.sanitaryContactEmail ? (
              <>
                <p>complétée, à envoyer par e-mail à</p>
                <p>{session.sanitaryContactEmail}</p>
              </>
            ) : (
              "complétée, sous enveloppe destinée au référent sanitaire"
            )}
          </label>
        </div>

        {meetingPoint?.bus?.lunchBreak && (
          <div className="flex items-baseline gap-4">
            <input type="checkbox" name="collation" id="collation" checked={todo.collation} onChange={handleCheck} />
            <label htmlFor="collation">
              Un <strong>repas froid</strong> selon la durée de votre trajet.
            </label>
          </div>
        )}
        {!isCLE && (
          <>
            <Arrow className="absolute left-72 top-5 hidden lg:block" />
            <DontForget className="absolute left-72 top-10 hidden lg:block" />
          </>
        )}
      </div>
    </>
  );
}
