import { BsExclamationCircle } from "react-icons/bs";

export default function ModalExportPdfFile(responsive) {
    console.log(responsive)
  return (
    // <div className="flex items-start justify-center mb-2 border-[1px] border-gray-200 rounded-lg shadow-sm lg:items-center">
    <div className={`${responsive.responsive}`}>
    <BsExclamationCircle className="h-[20px] w-[65px] text-red-500 sm:mt-7 lg:h-6 w-6 ml-2 lg:mt-0" />
    <span className="ml-3 text-black text-[14px] lg:ml-2 mt-4 mb-6">
      En cas de convocation aux épreuves du Baccalauréat du second groupe, vous arriverez au centre par vos propres moyens <strong>Le 8 juillet</strong>.
    </span>
  </div>
  );
}