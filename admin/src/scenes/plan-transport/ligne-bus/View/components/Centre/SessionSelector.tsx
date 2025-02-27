import { AuthState } from "@/redux/auth/reducer";
import React from "react";
import { useSelector } from "react-redux";
import CentreLabel from "./CentreLabel";
import { isSuperAdmin, LigneBusDto, ROLES } from "snu-lib";
import { BsSearch } from "react-icons/bs";
import useSessions, { SessionPhase1PopulatedWithCenter } from "@/scenes/plan-transport/lib/useSessions";
import { AiOutlineStop } from "react-icons/ai";
import Loader from "@/components/Loader";

type Props = {
  sessionId: string;
  setSessionId: (string) => void;
  ligne: LigneBusDto;
  disabled: boolean;
};

function filterResults(data: SessionPhase1PopulatedWithCenter[], search: string) {
  if (search === "") return data;
  const searchFields = ["name", "address", "region", "department", "code", "city", "zip", "matricule"];
  return data.filter((item) => {
    return searchFields.some((field) => item.cohesionCenter[field]?.toString().toLowerCase().includes(search.toLowerCase()));
  });
}

export default function SessionSelector({ sessionId, setSessionId, ligne, disabled }: Props) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const [search, setSearch] = React.useState("");
  const { data: sessions, isPending, isError } = useSessions(ligne.cohort);
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

  if (isPending) return <Loader />;
  if (isError) return <div>Erreur</div>;

  const selectedSession = sessions?.find((s) => s._id === sessionId);
  const filteredData = filterResults(sessions, search);

  function handleSelect(session: SessionPhase1PopulatedWithCenter) {
    setSessionId(session._id);
    setOpen(false);
  }

  return (
    <>
      <div className="flex flex-col border border-gray-300 rounded-lg py-2 px-2.5">
        <div className="flex justify-between">
          <CentreLabel centre={selectedSession!.cohesionCenter} showLink={user.role !== ROLES.TRANSPORTER} />
          {isSuperAdmin(user) && !disabled && (
            <button type="button" ref={refButtonChangesPDR} className="text-xs font-normal leading-6 text-blue-500">
              Changer de lieu
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="relative">
          <div ref={refSelect} className="max-h-[500px] overflow-y-auto absolute left-0 z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg">
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
              {filteredData.length === 0 ? (
                <div className="text-xs leading-4 text-gray-900">Aucun centre de cohésion trouvé</div>
              ) : (
                filteredData.map((session) => <CenterButton key={session._id} session={session} ligne={ligne} onClick={() => handleSelect(session)} />)
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CenterButton({ session, ligne, onClick }) {
  const disabled = session.placesLeft === 0 || session.placesLeft < ligne.youngSeatsTaken;
  return (
    <>
      <button type="button" onClick={onClick} disabled={disabled} className="my-2 w-full gap-4 rounded-lg py-1 px-2 hover:bg-gray-50 disabled:cursor-not-allowed group">
        <CentreLabel centre={session.cohesionCenter} showLink={false} className={disabled ? "text-gray-400" : ""} />
        <p className="mt-1 text-xs text-gray-600 text-left group-disabled:text-gray-400">
          {disabled && <AiOutlineStop className="inline-block mr-1 mb-1 text-gray-400" />}
          {session.placesLeft} places restantes
        </p>
      </button>
      <hr />
    </>
  );
}
