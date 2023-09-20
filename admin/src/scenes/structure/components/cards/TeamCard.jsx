import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import API from "@/services/api";
import { getInitials } from "@/utils";
import Plus from "@/assets/icons/Plus";
import Card from "../Card";
import TeamModal from "../modals/TeamModal";
import { useHistory } from "react-router-dom";

export default function TeamCard({ structure }) {
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(new URLSearchParams(history.location.search).get("prompt") === "team");
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      if (location.search === "?prompt=team") setIsOpen(true);
      else setIsOpen(false);
    });
    return unlisten();
  }, [history]);

  useEffect(() => {
    if (isOpen) history.replace({ search: "?prompt=team" });
    else history.replace({ search: "" });
  }, [isOpen, history]);

  const getTeam = async (structureId) => {
    try {
      const { data } = await API.post("/elasticsearch/referent/export", { filters: { structureId: [structureId] } });
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async () => {
      const data = await getTeam(structure._id);
      if (!data) return toastr.error("Erreur", "Une erreur est survenue lors de la récupération des responsables.", { timeOut: 10000, progressBar: true });
      setTeam(data);
    })();
  }, [structure]);

  if (!team?.length) return <div />;
  return (
    <>
      <Card className="h-36 w-64">
        <div className="relative h-full cursor-pointer" onClick={() => setIsOpen(true)}>
          <div className="absolute my-6 px-7">
            <p className="mb-1 text-sm">L&apos;équipe</p>
            <p className="text-xs text-gray-500">
              {team.length} {structure.isNetwork ? "membre" : "responsable"}
              {team.length > 1 && "s"}
            </p>
            <div className="mt-4 flex flex-row -space-x-2">
              {team.map((contact, index) => {
                if (index < 6)
                  return (
                    <div key={index} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-blue-600`}>
                      {getInitials(contact.firstName + " " + contact.lastName)}
                    </div>
                  );
              })}
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-blue-600`}>
                <Plus />
              </div>
            </div>
          </div>
        </div>
      </Card>
      <TeamModal isOpen={isOpen} onCancel={() => setIsOpen(false)} team={team} setTeam={setTeam} structure={structure} />
    </>
  );
}
