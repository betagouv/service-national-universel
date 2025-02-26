import { AuthState } from "@/redux/auth/reducer";
import React from "react";
import { useSelector } from "react-redux";
import CentreLabel from "./CentreLabel";
import { CenterDetailDto, CohesionCenterType, CohortType, isSuperAdmin, ROLES } from "snu-lib";
import { BsSearch } from "react-icons/bs";
import useCentres from "@/scenes/plan-transport/lib/useCenters";

type CentreSelectorProps = {
  center: CenterDetailDto;
  setCenter: (data) => void;
  cohort: CohortType;
  disabled: boolean;
};

function filterResults(data: CohesionCenterType[], search: string) {
  if (search === "") return data;
  const searchFields = ["name", "address", "region", "department", "code", "city", "zip", "matricule"];
  return data.filter((item) => {
    return searchFields.some((field) => item[field]?.toString().toLowerCase().includes(search.toLowerCase()));
  });
}

export default function CentreSelector({ center, setCenter, cohort, disabled }: CentreSelectorProps) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const [search, setSearch] = React.useState("");
  const { data, isPending, isError } = useCentres(cohort.name);

  const [open, setOpen] = React.useState(false);
  const refSelect = React.useRef<HTMLDivElement>(null);
  const refInput = React.useRef<HTMLInputElement>(null);
  const refButtonChangesPDR = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refButtonChangesPDR.current && refButtonChangesPDR.current.contains(event.target)) {
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

  const filteredData = filterResults(data!, search);
  console.log("🚀 ~ CentreSelector ~ filteredData:", filteredData);

  return (
    <>
      <div className="flex flex-col border border-gray-300 rounded-lg py-2 px-2.5">
        <div className="flex justify-between">
          <CentreLabel centre={center} showLink={user.role !== ROLES.TRANSPORTER} />
          {isSuperAdmin(user) && !disabled && (
            <button type="button" ref={refButtonChangesPDR} className="text-xs font-normal leading-6 text-blue-500">
              Changer de lieu
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="relative">
          <div ref={refSelect} className="max-h-[300px] overflow-y-auto absolute left-0 z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg">
            <div className="sticky top-0 z-10 bg-white pt-3">
              <div className="flex flex-row items-center gap-2">
                <BsSearch className="text-gray-400" />
                <input
                  ref={refInput}
                  type="text"
                  placeholder="Rechercher un centre"
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-[13px] leading-3 text-gray-800"
                />
              </div>
              <hr className="my-2" />
            </div>
            <div className="pb-2">
              {isPending ? (
                <div className="text-xs leading-4 text-gray-900">Chargement...</div>
              ) : isError ? (
                <div className="text-xs leading-4 text-red-900">Une erreur est survenue</div>
              ) : filteredData.length === 0 ? (
                <div className="text-xs leading-4 text-gray-900">Aucun centre de cohésion trouvé</div>
              ) : (
                filteredData.map((c) => (
                  <div key={c.code}>
                    <button
                      type="button"
                      onClick={() => {
                        setCenter(c);
                        setOpen(false);
                      }}
                      className="w-full gap-4 rounded-lg py-1 px-2 hover:bg-gray-50 ">
                      <CentreLabel centre={c} showLink={false} />
                    </button>
                    <hr className="my-2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
