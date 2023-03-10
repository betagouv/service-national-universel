import React from "react";
import ReactTooltip from "react-tooltip";
import Field from "../../../components/forms/Field";
import FloppyDisk from "../../../assets/icons/FloppyDisk";

export const SaveDisk = ({ saveTitle, modalSaveVisible, setModalSaveVisible, saveFilter }) => {
  // handle click outside
  const ref = React.useRef();
  const [nameView, setNameView] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setModalSaveVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  React.useEffect(() => {
    if (nameView) return setError("");
  }, [nameView]);

  const handleSave = async () => {
    if (loading) return;
    if (!nameView) return setError("Veuillez saisir un nom pour votre vue");
    setError("");
    setLoading(true);
    const res = await saveFilter(nameView);
    if (res.ok) setNameView("");
    setLoading(false);
  };

  return (
    <>
      <ReactTooltip id="tooltip-saveFilter" className="bg-white !rounded-lg shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
        <div>
          <div className="text-xs text-gray-600">Enregistrer cette vue...</div>
          <div className="text-gray-600 font-bold">{saveTitle.join(", ")}</div>
        </div>
      </ReactTooltip>
      <div className="relative">
        <div
          data-tip=""
          data-for="tooltip-saveFilter"
          onClick={() => setModalSaveVisible(true)}
          className="p-2 h-[42px] w-[42px] bg-gray-100 rounded flex items-center justify-center cursor-pointer">
          <FloppyDisk />
        </div>

        {modalSaveVisible && (
          <div className="absolute left-0 z-10 mt-2 bg-white w-[492px]  rounded-lg shadow-lg px-8" ref={ref}>
            <div className="font-bold text-sm text-gray-800 mt-6">Enregistrer une nouvelle (groupe de filtres)</div>
            <div className="font-medium text-xs mt-3 mb-2">Nommez la vue</div>
            <Field name="nameView" label="Nom de la vue" value={nameView} errors={{ nameView: error }} handleChange={(e) => setNameView(e.target.value)} />
            <div className="flex justify-end items-center">
              <div onClick={handleSave} className={` ${loading && "opacity-50"} bg-blue-600 text-white px-3 py-2 rounded-md w-fit my-4 self-end cursor-pointer`}>
                Enregistrer
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
