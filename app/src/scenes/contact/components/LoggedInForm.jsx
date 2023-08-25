import React, { useState } from "react";
import { Link } from "react-router-dom";
import Unlock from "@/assets/icons/Unlock";
import { HiArrowRight } from "react-icons/hi";
import QuestionBubble from "@/assets/icons/QuestionBubble";

export default function LoggedInForm() {
  const [role, setRole] = useState("young");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");

  return (
    <>
      <div className="my-8 flex gap-4 items-center w-full border-[1px] text-sm">
        <div className="flex-none flex items-center justify-center w-24 h-24">
          <Unlock />
        </div>
        <div>
          <p>Débloquez votre accès gratuit au code de la route</p>
          <Link to="/phase1" className="text-blue-france-sun-113 underline underline-offset-4">
            En savoir plus
            <HiArrowRight className="inline-block ml-2" />
          </Link>
        </div>
      </div>

      <div className="my-8 flex gap-4 items-center w-full border-[1px] text-sm">
        <div className="flex-none flex items-center justify-center w-24 h-24">
          <QuestionBubble />
        </div>
        <div className="p-2">
          <p className="leading-relaxed">Des questions sur le Recensement, la Journée Défense et Mémoire (JDM) ou la Journée Défense et Citoyenneté (JDC) ?</p>
          <Link to="/phase1" className="text-blue-france-sun-113 underline underline-offset-4">
            En savoir plus
            <HiArrowRight className="inline-block ml-2" />
          </Link>
        </div>
      </div>
    </>
  );
}
