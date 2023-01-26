import React from "react";
import { PlainButton } from "../../../components/Buttons";

export default function Resum({ nextStep }) {
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async () => {
    setIsLoading(true);
  };
  return (
    <>
      <div className="flex flex-col w-full rounded-xl bg-white mt-8 pt-12 pb-24 px-8 gap-6">
        <div className="text-xl leading-7 font-medium text-gray-900 text-center pb-4">Vous vous apprêtez à importer...</div>
        <div className="flex items-stretch justify-center gap-6 pt-6 pb-12">
          <div className="flex flex-col px-4 rounded-xl bg-gray-100 w-52 h-32 justify-center">
            <div className="text-[42px] leading-[120%] font-extrabold text-gray-800">156</div>
            <dic className="text-xs leading-5 font-medium text-gray-800">lignes de transport</dic>
          </div>
          <div className="flex flex-col px-4 rounded-xl bg-gray-100 w-52 h-32 justify-center">
            <div className="text-[42px] leading-[120%] font-extrabold text-gray-800">90</div>
            <dic className="text-xs leading-5 font-medium text-gray-800">centres de cohésion</dic>
          </div>
          <div className="flex flex-col px-4 rounded-xl bg-gray-100 w-52 h-32 justify-center">
            <div className="text-[42px] leading-[120%] font-extrabold text-gray-800">156</div>
            <dic className="text-xs leading-5 font-medium text-gray-800">points de rassemblement</dic>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <PlainButton className="w-52" disabled={isLoading} spinner={isLoading} onClick={onSubmit}>
          Importer
        </PlainButton>
      </div>
    </>
  );
}
