import dayjs from "@/utils/dayjs.utils";
import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ROLES, translate } from "snu-lib";
import Loader from "../../../../../components/Loader";
import { capture } from "../../../../../sentry";
import api from "../../../../../services/api";
import { getInitials, getStatusClass, translateStatus } from "../../../components/commons";
import Chat from "../../components/Icons/Chat";
import Quote from "../../components/Icons/Quote";
import Thumbs from "../../components/Icons/Thumbs";
import View from "../../modificationPanel/View";

export default function Modification({ demandeDeModification, getModification }) {
  const [panel, setPanel] = React.useState({ open: false });
  const [tagsOptions, setTagsOptions] = React.useState(null);
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  const redirectDemande = new URLSearchParams(window.location.search).get("demande");

  const getTags = async () => {
    try {
      const { ok, code, data: reponseTags } = await api.get(`/tags?type=modification_bus`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des tags", translate(code));
      }
      const options = reponseTags.map((tag) => {
        return { value: tag._id, label: tag.name };
      });
      setTagsOptions(options);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des tags");
    }
  };

  React.useEffect(() => {
    if (panel.open) {
      const id = panel.modification._id;
      const index = demandeDeModification.findIndex((item) => item._id === id);
      const newModification = demandeDeModification[index];
      setPanel({ open: true, modification: newModification });
    }
    if (redirectDemande) {
      const id = redirectDemande;
      const index = demandeDeModification.findIndex((item) => item._id === id);
      const newModification = demandeDeModification[index];
      setPanel({ open: true, modification: newModification });
      history.replace({
        search: null,
      });
    }
  }, [demandeDeModification]);

  React.useEffect(() => {
    getTags();
  }, []);

  if (!demandeDeModification || !tagsOptions)
    return (
      <div className="w-1/2 rounded-xl bg-white p-8">
        <Loader />
      </div>
    );

  return (
    <div className="w-1/2 rounded-xl bg-white p-8">
      <div className="text-lg leading-7 text-gray-900 font-bold">Demandes de modifications ({demandeDeModification.length})</div>
      <div className="mt-4 flex max-h-[300px] flex-col gap-4 overflow-y-auto">
        {demandeDeModification.map((modification, index) => (
          <div key={index} className=" mr-1 flex flex-col gap-2">
            <div
              className={`group relative flex w-full flex-col gap-2 rounded-xl bg-[#F6F7F9] p-4 ${[ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) ? "cursor-pointer" : ""}`}
              onClick={() => [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && setPanel({ open: true, modification })}>
              {[ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && (
                <div className="absolute top-0 right-0 hidden h-full w-full items-center justify-center rounded-xl bg-black opacity-70 transition duration-300 ease-in-out group-hover:flex">
                  <div className="text-base font-bold leading-6 text-white hover:underline">Voir la demande</div>
                  <div className="absolute bottom-3 right-5 flex items-center gap-1 text-sm leading-6 text-white">
                    <Chat className="text-white" />
                    {modification?.messages.length} Commentaire(s)
                  </div>
                </div>
              )}
              <div className="flex justify-start">
                <Quote className="text-gray-400" />
              </div>
              <div className="whitespace-pre-wrap text-sm leading-5 text-gray-800">{modification.requestMessage}</div>
              <div className="flex justify-end">
                <Quote className="rotate-180 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-between py-1">
              <div className="flex items-center gap-2">
                <div className={`flex h-[22px] items-center justify-center rounded-full px-3 text-xs text-white ${getStatusClass(modification.status)}`}>
                  {translateStatus(modification.status)}
                </div>
                {modification?.opinion && [ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role) && (
                  <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#3D5B85] text-xs text-white">
                    <Thumbs className={`h-3 w-3 text-white ${modification.opinion === "false" && "rotate-180"}`} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1px] border-white bg-gray-100 text-[10px] text-blue-600 shadow-md">
                  {getInitials(modification?.requestUserName)}
                </div>
                <div className="text-xs text-gray-800">
                  {modification?.requestUserName}, {dayjs(modification.createdAt).format("DD/MM/YYYY • HH:mm")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <View
        open={panel.open}
        setOpen={() => setPanel({ open: false })}
        modification={panel.modification}
        getModification={getModification}
        tagsOptions={tagsOptions}
        getTags={getTags}
      />
    </div>
  );
}
