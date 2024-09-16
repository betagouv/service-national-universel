import React from "react";
import ReactTooltip from "react-tooltip";
import Field from "../../forms/Field";
import FloppyDisk from "../../../assets/icons/FloppyDisk";
import { saveTitle, currentFilterAsUrl } from "./filters/utils";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";

export default function Save({ filterArray, selectedFilters, page = 1, pageId, disabled = false }) {
  // handle click outside
  const ref = React.useRef();
  const [nameView, setNameView] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [modalSaveVisible, setModalSaveVisible] = React.useState(false);
  const history = useHistory();
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

  const saveFilter = async (name) => {
    try {
      const res = await api.post("/filters", {
        page: pageId,
        url: currentFilterAsUrl(selectedFilters, page, filterArray),
        name: name,
      });
      if (!res.ok) return toastr.error("Oops, une erreur est survenue");
      toastr.success("Filtre sauvegardé avec succès");
      history.go(0);
      return res;
    } catch (error) {
      console.log(error);
      if (error.code === "ALREADY_EXISTS") return toastr.error("Oops, le filtre existe déjà");
      return error;
    }
  };

  const handleSave = async () => {
    if (loading) return;
    if (!nameView) return setError("Veuillez saisir un nom pour votre vue");
    setError("");
    setLoading(true);
    const res = await saveFilter(nameView);
    if (res.ok) setNameView("");
    setLoading(false);
  };
  const title = saveTitle(selectedFilters, filterArray).join(", ");

  // pas de titre === pas de fitlre selectionné
  if (!title) return null;
  if (disabled) return null;

  return (
    <>
      <ReactTooltip id="tooltip-saveFilter" className="!rounded-lg bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
        <div>
          <div className="text-xs text-gray-600">Enregistrer cette vue...</div>
          <div className="font-bold text-gray-600">{saveTitle(selectedFilters, filterArray).join(", ")}</div>
        </div>
      </ReactTooltip>
      <div className="relative mr-1">
        <div
          data-tip=""
          data-for="tooltip-saveFilter"
          onClick={() => setModalSaveVisible(true)}
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded bg-gray-100 p-2 hover:bg-gray-200">
          <FloppyDisk />
        </div>

        {modalSaveVisible && (
          <div className="absolute left-0 z-10 mt-2 w-[492px] rounded-lg  bg-white px-8 shadow-lg" ref={ref}>
            <div className="mt-6 text-sm font-bold text-gray-800">Enregistrer une nouvelle (groupe de filtres)</div>
            <div className="mt-3 mb-2 text-xs font-medium">Nommez la vue</div>
            <Field autoFocus name="nameView" label="Nom de la vue" value={nameView} errors={{ nameView: error }} handleChange={(e) => setNameView(e.target.value)} />
            <div className="flex items-center justify-end">
              <div onClick={handleSave} className={` ${loading && "opacity-50"} my-4 w-fit cursor-pointer self-end rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700`}>
                Enregistrer
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
