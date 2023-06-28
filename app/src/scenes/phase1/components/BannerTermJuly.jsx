import React from "react";
import { BsExclamationCircle } from "react-icons/bs";

export default function ModalExportPdfFile(responsive) {
  return (
    <div className={`${responsive.responsive}`}>
      <BsExclamationCircle className="h-[20px] w-[65px] text-red-500 sm:mt-7 ml-2 lg:h-6 w-6 lg:mt-0" />
      <span className="ml-2 text-black text-[14px] lg:ml-2 mt-4 mb-6">
        En cas de convocation aux épreuves du Baccalauréat du second groupe, vous arriverez au centre par vos propres moyens <strong>Le 8 juillet</strong>.
      </span>
    </div>
  );
}
