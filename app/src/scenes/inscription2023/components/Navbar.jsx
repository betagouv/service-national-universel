import React from "react";
import useDevice from "../../../hooks/useDevice";
import save from "../../../assets/save.svg";
import { useParams } from "react-router-dom";
import { getStepFromUrlParam, INSCRIPTION_STEPS_LIST } from "../../../utils/navigation";

const index = {
  COORDONNEES: "1",
  CONSENTEMENTS: "2",
  REPRESENTANTS: "3",
  DOCUMENTS: "4",
  UPLOAD: "4",
};

const wording = {
  COORDONNEES: "Dites-nous en plus sur vous",
  CONSENTEMENTS: "Consentements",
  REPRESENTANTS: "Mes représentants légaux",
  DOCUMENTS: "Justifier de mon identité",
  UPLOAD: "Justifier de mon identité",
};

const next = {
  COORDONNEES: "Consentement",
  CONSENTEMENTS: "Mes représentants légaux",
  REPRESENTANTS: "Justifier de mon identité",
};

const Navbar = ({ onSave }) => {
  const desktop = useDevice() === "desktop";

  const { step } = useParams();
  const currentStep = getStepFromUrlParam(step, INSCRIPTION_STEPS_LIST, true);

  return (
    <div className="w-full bg-[#f9f6f2] px-3 text-[#161616] py-[1rem] md:pt-[2rem] md:pb-[0rem]">
      <div className="flex flex-col justify-center md:mx-auto md:my-0 md:w-1/2">
        <div className="flex justify-between">
          <div>
            <div className="text-sm">Étape {index[currentStep]} sur 4</div>
            <div className="mt-2 text-lg font-bold">{wording[currentStep]}</div>
          </div>
          {onSave && <img src={save} onClick={onSave} className="cursor-pointer" />}
        </div>

        <div className="mt-2 flex w-full space-x-2">
          <div className="h-2 basis-1/3 bg-[#000091]"></div>
          <div className={`h-2  basis-1/3 ${currentStep !== "COORDONNEES" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`h-2  basis-1/3 ${["REPRESENTANTS", "DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`h-2  basis-1/3 ${["DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        </div>
        {desktop && (
          <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
            <div className="font-bold">{["COORDONNEES", "CONSENTEMENTS", "REPRESENTANTS"].includes(currentStep) && "Étape suivante:"}</div>
            <div>{next[currentStep]}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;




// import React from "react";
// import useDevice from "../../../hooks/useDevice";
// import save from "../../../assets/save.svg";
// import { useParams } from "react-router-dom";
// import { getStepFromUrlParam, INSCRIPTION_STEPS_LIST } from "../../../utils/navigation";
// import useAuth from "@/services/useAuth";
// import { YOUNG_SOURCE } from "snu-lib";

// const getIndex = (step, source) => {
//   if (source === YOUNG_SOURCE.CLE) {
//     return {
//       COORDONNEES: "1",
//       CONSENTEMENTS: "2",
//       REPRESENTANTS: "3",
//     }[step];
//   }
//   return {
//     COORDONNEES: "1",
//     CONSENTEMENTS: "2",
//     REPRESENTANTS: "3",
//     DOCUMENTS: "4",
//     UPLOAD: "4",
//   }[step];
// };

// const getWording = (step, source) => {
//   if (source === YOUNG_SOURCE.CLE) {
//     return {
//       COORDONNEES: "Dites-nous en plus sur vous",
//       CONSENTEMENTS: "Consentements",
//       REPRESENTANTS: "Mes représentants légaux",
//       // Pas de DOCUMENTS et UPLOAD pour YOUNG_SOURCE.CLE
//     }[step];
//   }
//   return {
//     COORDONNEES: "Dites-nous en plus sur vous",
//     CONSENTEMENTS: "Consentements",
//     REPRESENTANTS: "Mes représentants légaux",
//     DOCUMENTS: "Justifier de mon identité",
//     UPLOAD: "Justifier de mon identité",
//   }[step];
// };

// const getNext = (step, source) => {
//   if (source === YOUNG_SOURCE.CLE) {
//     return {
//       COORDONNEES: "Consentement",
//       CONSENTEMENTS: "Mes représentants légaux",
//     }[step];
//   }
//   return {
//     COORDONNEES: "Consentement",
//     CONSENTEMENTS: "Mes représentants légaux",
//     REPRESENTANTS: "Justifier de mon identité",
//   }[step];
// };

// // const index = {
// //   COORDONNEES: "1",
// //   CONSENTEMENTS: "2",
// //   REPRESENTANTS: "3",
// //   DOCUMENTS: "4",
// //   UPLOAD: "4",
// // };

// // const wording = {
// //   COORDONNEES: "Dites-nous en plus sur vous",
// //   CONSENTEMENTS: "Consentements",
// //   REPRESENTANTS: "Mes représentants légaux",
// //   DOCUMENTS: "Justifier de mon identité",
// //   UPLOAD: "Justifier de mon identité",
// // };

// // const next = {
// //   COORDONNEES: "Consentement",
// //   CONSENTEMENTS: "Mes représentants légaux",
// //   REPRESENTANTS: "Justifier de mon identité",
// // };

// const Navbar = ({ onSave }) => {
//   const desktop = useDevice() === "desktop";
//   const { step } = useParams();
//   const currentStep = getStepFromUrlParam(step, INSCRIPTION_STEPS_LIST, true);
//   const { young } = useAuth();
//   const totalSteps = young.source === YOUNG_SOURCE.CLE ? 3 : 4;
//   const stepIndex = getIndex(currentStep, young.source);
//   const stepWording = getWording(currentStep, young.source);
//   const nextStep = getNext(currentStep, young.source);

//   return (
//     <div className="w-full bg-[#f9f6f2] px-3 text-[#161616] py-[1rem] md:pt-[2rem] md:pb-[0rem]">
//       <div className="flex flex-col justify-center md:mx-auto md:my-0 md:w-1/2">
//         <div className="flex justify-between">
//           <div>
//             {/* <div className="text-sm">Étape {index[currentStep]} sur 4</div>
//             <div className="mt-2 text-lg font-bold">{wording[currentStep]}</div> */}
//             <div className="text-sm">
//               Étape {stepIndex} sur {totalSteps}
//             </div>
//             <div className="mt-2 text-lg font-bold">{stepWording}</div>
//           </div>
//           {onSave && <img src={save} onClick={onSave} className="cursor-pointer" />}
//         </div>

//         {/* <div className="mt-2 flex w-full space-x-2">
//           <div className="h-2 basis-1/3 bg-[#000091]"></div>
//           <div className={`h-2  basis-1/3 ${currentStep !== "COORDONNEES" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
//           <div className={`h-2  basis-1/3 ${["REPRESENTANTS", "DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
//           <div className={`h-2  basis-1/3 ${["DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
//         </div> */}
//         <div className="mt-2 flex w-full space-x-2">
//           <div className={`"h-2 basis-1/${totalSteps} bg-[#000091]"`}></div>
//           <div className={`h-2 basis-1/${totalSteps} ${currentStep !== "COORDONNEES" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
//           {/* Répétez pour les autres étapes, en ajustant la condition pour chaque étape */}
//           {totalSteps === 4 && (
//             <>
//               <div className="h-2 basis-1/3 bg-[#000091]"></div>
//               <div className={`h-2  basis-1/3 ${currentStep !== "COORDONNEES" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
//               <div className={`h-2 basis-1/3 ${["REPRESENTANTS", "DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
//               <div className={`h-2 basis-1/3 ${["DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
//             </>
//           )}
//         </div>
//         {desktop && (
//           <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
//             <div className="font-bold">{["COORDONNEES", "CONSENTEMENTS", "REPRESENTANTS"].includes(currentStep) && "Étape suivante:"}</div>
//             <div>{nextStep[currentStep]}</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Navbar;
