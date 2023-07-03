import React from "react";
import { BsSearch } from "react-icons/bs";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";

const keys = ["code", "name", "city", "zip", "department", "region"];

export default function PointDeRassemblement({ ligne, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [listPDR, setListPDR] = React.useState([]);
  const [filteredPDR, setFilteredPDR] = React.useState([]);
  const [search, setSearch] = React.useState("");

  const refSelect = React.useRef(null);
  const refInput = React.useRef(null);
  const refContainer = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContainer.current && refContainer.current.contains(event.target)) {
        setOpen((open) => !open);
      } else if (refSelect.current && !refSelect.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { ok, data } = await api.get(`/ligne-de-bus/${ligne._id}/availablePDR`);
        if (!ok) {
          return;
        }
        setListPDR(data);
        setFilteredPDR(data);
      } catch (error) {
        capture(error);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (listPDR.length === 0) return;
    let filteredPDR = listPDR
      .filter((item) => {
        if (search === "") return true;
        for (let key of keys) {
          if (item[key].toLowerCase().includes(search?.toLowerCase())) {
            return true;
          }
        }
        return false;
      })
      .filter((item) => !ligne.meetingPointsIds.includes(item._id.toString()));

    setFilteredPDR(filteredPDR);
  }, [search, listPDR, ligne]);

  React.useEffect(() => {
    if (open) refInput.current.focus();
  }, [open]);

  return (
    <div className="w-full rounded-xl bg-white p-2">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div
            ref={refContainer}
            className={`flex w-full items-center justify-between rounded-lg bg-white py-2 px-2.5 ${open ? "border-2 border-blue-500" : "border-[1px] border-gray-300"}`}>
            <div className="flex w-[90%] flex-col justify-center">
              <div className="text-xs font-normal leading-6 text-gray-500">+ Ajouter un point de rassemblement</div>
            </div>
          </div>
          <div
            ref={refSelect}
            className={`${!open ? "hidden" : ""} ${
              filteredPDR.length > 5 ? "h-[300px] overflow-y-auto" : ""
            } absolute left-0 z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg`}>
            <div className="sticky top-0 z-10 bg-white pt-3">
              <div className="flex flex-row items-center gap-2">
                <BsSearch className="text-gray-400" />
                <input
                  autoFocus
                  ref={refInput}
                  type="text"
                  placeholder="Rechercher un point de rassemblement"
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-[13px] leading-3 text-gray-800"
                />
              </div>
              <hr className="my-2" />
            </div>
            {filteredPDR.map((p) => (
              <div key={p._id}>
                <div
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-4 rounded-lg py-1 px-2 hover:bg-gray-50 ">
                  <div className="text-sm leading-5 text-gray-900">{p.name}</div>
                  <div className="flex-1 truncate text-sm leading-5 text-gray-500">
                    {p.department} • {p.region}
                  </div>
                </div>
                <hr className="my-2" />
              </div>
            ))}
            {filteredPDR.length === 0 && (
              <div className="flex items-center justify-center gap-2 pt-2 pb-4">
                <div className="text-xs leading-4 text-gray-900">Aucun point de rassemblement trouvé</div>
              </div>
            )}
            <div className="flex flex-col items-center justify-center gap-2 pb-3">
              <div className="text-sm leading-5 text-gray-900">Le point de rassemblement n’est pas dans la liste ?</div>
              <a
                href="/point-de-rassemblement/liste/liste-points?modal_creation_open=1"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer rounded-lg py-1 px-2 text-xs leading-4 text-blue-600 hover:bg-blue-50">
                Rattacher un point de rassemblement
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
