import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import CheckBox from "../../../components/inscription/checkbox";
import StickyButton from "../../../components/inscription/stickyButton";

export default function MobileCniInvalide() {
  const history = useHistory();
  const [check, setCheck] = useState(false);
  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Déclaration sur l’honneur</h1>
        <p>Malheureusement, la pièce d’identité de XXXXXXXXX périme d’ici son départ en séjour de cohésion prévu le 13 février 2022.</p>
        <div className="flex flex-col gap-4 mt-4 pb-2">
          <div className="text-[#161616] text-base">
            Je, <strong>XXXXXXXXX</strong>,
          </div>
          <div className="flex items-center gap-4">
            <CheckBox checked={check} onChange={(e) => setCheck(e)} />
            <div className="text-[#3A3A3A] text-sm flex-1">
              Certifie sur l&apos;honneur avoir initié des démarches de renouvellement de la pièce d&apos;identité de Joao DA SILVA.
            </div>
          </div>
        </div>
      </div>
      <StickyButton
        text="Valider ma déclaration"
        onClick={() => {
          history.push("/representants-legaux/presentation");
        }}
      />
    </>
  );
}
