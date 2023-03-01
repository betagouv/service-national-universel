import dayjs from "dayjs";
import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ROLES, translate } from "snu-lib";
import Loader from "../../../../components/Loader";
import PanelV2 from "../../../../components/PanelV2";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { getInitials, getStatusClass, translateStatus } from "../../components/commons";
import Chat from "../components/Icons/Chat";
import Quote from "../components/Icons/Quote";
import Thumbs from "../components/Icons/Thumbs";

export default function List({ open, setOpen, busId }) {
  const user = useSelector((state) => state.Auth.user);
  const [demandeDeModification, setDemandeDeModification] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();

  const onClose = () => {
    setOpen({ open: false });
  };

  const getDemandeDeModification = async () => {
    try {
      const { ok, code, data: reponseDemandeDeModification } = await api.get(`/demande-de-modification/ligne/${busId}`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      reponseDemandeDeModification.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setDemandeDeModification(reponseDemandeDeModification);
      setLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  React.useEffect(() => {
    setLoading(true);
    if (busId) {
      getDemandeDeModification();
    }
  }, [busId]);

  if (!busId) return null;

  return (
    <PanelV2 title={`Demandes de modifications (${loading ? "..." : demandeDeModification.length})`} open={open} onClose={onClose}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="pt-6 pb-2">
            {demandeDeModification.map((modification, index) => (
              <div key={index} className=" flex flex-col gap-2 mr-1 py-3">
                <div
                  className={`group relative flex flex-col gap-2 rounded-xl bg-[#F6F7F9] w-full p-4 ${
                    [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) ? "cursor-pointer" : ""
                  }`}
                  onClick={() => [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && history.push(`/ligne-de-bus/${busId}?demande=${modification._id.toString()}`)}>
                  {[ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && (
                    <div className="absolute top-0 right-0 w-full h-full rounded-xl bg-black opacity-70 hidden group-hover:flex items-center justify-center transition duration-300 ease-in-out">
                      <div className="text-white text-base font-bold leading-6 hover:underline">Voir la demande</div>
                      <div className="absolute bottom-3 right-5 text-white text-sm leading-6 flex items-center gap-1">
                        <Chat className="text-white" />
                        {modification?.messages.length} Commentaire(s)
                      </div>
                    </div>
                  )}
                  <div className="flex justify-start">
                    <Quote className="text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-800 leading-5 whitespace-pre-wrap">{modification.requestMessage}</div>
                  <div className="flex justify-end">
                    <Quote className="text-gray-400 rotate-180" />
                  </div>
                </div>

                <div className="flex justify-between py-1">
                  <div className="flex gap-2 items-center">
                    <div className={`flex items-center justify-center text-white text-xs rounded-full h-[22px] px-3 ${getStatusClass(modification.status)}`}>
                      {translateStatus(modification.status)}
                    </div>
                    {modification?.opinion && [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && (
                      <div className="flex items-center justify-center text-white text-xs rounded-full h-[22px] w-[22px] bg-[#3D5B85]">
                        <Thumbs className={`text-white h-3 w-3 ${modification.opinion === "false" && "rotate-180"}`} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center justify-center text-blue-600 text-[10px] rounded-full h-[22px] w-[22px] bg-gray-100 border-[1px] border-white shadow-md">
                      {getInitials(modification?.requestUserName)}
                    </div>
                    <div className="text-xs text-gray-800">
                      {modification?.requestUserName}, {dayjs(modification.createdAt).locale("fr").format("DD/MM/YYYY • HH:mm")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PanelV2>
  );
}
