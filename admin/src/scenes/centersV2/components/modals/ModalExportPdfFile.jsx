import ModalTailwind from "../../../../components/modals/ModalTailwind";
import { BiLoaderAlt } from "react-icons/bi";

export default function ModalExportMail({ isOpen, title, message, estimation }) {

  return (
    <ModalTailwind isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-[700px] rounded-xl bg-white">
      <div className="w-full">
        <div className="pb-16 pt-14">
          <div className="flex flex-col items-center justify-center text-center text-lg font-bold text-gray-500">
            <h1 className="mb-2">{title}</h1>
            <p className="text-gray-400 text-xs mb-6">{message}</p>
            <span className="animate-spin mb-2">
              <BiLoaderAlt className="h-16 w-16" />
            </span>
            <p className="text-sm">{estimation}</p>
          </div>
        </div>
      </div>
    </ModalTailwind>
  );
}

