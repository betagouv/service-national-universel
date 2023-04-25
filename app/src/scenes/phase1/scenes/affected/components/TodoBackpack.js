import React, { useState } from "react";
import plausibleEvent from "../../../../../services/plausible.js";
import MedicalFileModal from "../../../components/MedicalFileModal.js";
import Arrow from "../assets/Arrow.js";
import DontForget from "../assets/DontForget.js";
import SnuBackPack from "../assets/SnuBackPack.js";
import { ModalConvocation } from "./ModalConvocation.js";

export default function TodoBackpack({ lunchBreak }) {
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
    <div className="mx-[0.5rem] flex overflow-hidden rounded-xl bg-white shadow-nina md:mx-[0rem] md:shadow-none lg:w-2/3">
      <MedicalFileModal isOpen={isMedicalFileModalOpen} onClose={() => setMedicalFileModalOpen(false)} />

      <div className="relative p-4">
        <h1 className="mb-6 text-xl font-bold">Dans mon sac...</h1>

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

        <div className="flex items-baseline gap-4">
          <input type="checkbox" name="sanitaire" id="sanitaire" checked={todo.sanitaire} onChange={handleCheck} />
          <label htmlFor="sanitaire">
            La{" "}
            <button onClick={() => setMedicalFileModalOpen(true)} className="h-6 font-semibold underline decoration-2 underline-offset-4">
              fiche sanitaire
            </button>{" "}
            complétée, sous enveloppe destinée au référent sanitaire
          </label>
        </div>

        <div className="flex items-baseline gap-4">
          <input type="checkbox" name="masques" id="masques" checked={todo.masques} onChange={handleCheck} />
          <label htmlFor="masques">
            Deux <strong>masques jetables</strong> à usage médical pour le transport en commun
          </label>
        </div>

        {lunchBreak && (
          <div className="flex items-baseline gap-4">
            <input type="checkbox" name="collation" id="collation" checked={todo.collation} onChange={handleCheck} />
            <label htmlFor="collation">
              Une <strong>collation ou un déjeuner froid</strong> pour le repas.
            </label>
          </div>
        )}
        <Arrow className="absolute left-80 top-10 hidden lg:block" />
        <DontForget className="absolute left-80 top-20 hidden lg:block" />
      </div>

      <SnuBackPack className="mt-4 block flex-none md:hidden md:h-64 md:w-64 xl:block" />

      <ModalConvocation open={modalConvocationOpen} setOpen={setModalConvocationOpen} />
    </div>
  );
}
