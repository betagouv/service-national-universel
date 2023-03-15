import React, { useState } from "react";
import plausibleEvent from "../../../../../services/plausible.js";
import SnuBackPack from "../../../../../assets/SnuBackPack.js";

export function DansMonSac({ setModalConvocationOpen }) {
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
    <div className="border relative bg-white rounded-xl shadow-nina md:shadow-none p-[1rem] md:p-[0rem] md:w-full">
      <SnuBackPack className="absolute right-0" />
      <div className="max-w-lg bg-cyan-200 space-y-4">
        <h1 className="text-xl font-bold mb-4 md:pt-2">Dans mon sac...</h1>
        <div className="flex gap-4 items-center">
          <input type="checkbox" name="convocation" id="convocation" checked={todo.convocation} onChange={handleCheck} />
          <label htmlFor="convocation">
            Votre{" "}
            <button onClick={() => setModalConvocationOpen(true)} className="font-semibold underline-offset-4 underline decoration-2">
              convocation
            </button>
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="identite" id="identite" checked={todo.identite} onChange={handleCheck} />
          <label htmlFor="identite">
            Votre <strong>pièce d&apos;identité</strong>
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="sanitaire" id="sanitaire" checked={todo.sanitaire} onChange={handleCheck} />
          <label htmlFor="sanitaire">
            La <strong>fiche sanitaire</strong> complétée, sous enveloppe destinée au référent sanitaire
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="masques" id="masques" checked={todo.masques} onChange={handleCheck} />
          <label htmlFor="masques">
            Deux <strong>masques jetables</strong> à usage médical pour le transport en commun
          </label>
        </div>

        <div className="flex gap-4 items-center">
          <input type="checkbox" name="collation" id="collation" checked={todo.collation} onChange={handleCheck} />
          <label htmlFor="collation">
            Une <strong>collation ou un déjeuner froid</strong> pour le repas.
          </label>
        </div>
      </div>
    </div>
  );
}
