import React, { useContext, useEffect, useState } from "react";
import { StructureContext } from "../../view";
import API from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { ES_NO_LIMIT } from "snu-lib";
import TeamModal from "../modals/TeamModal";
import { getInitials } from "../../../../utils";
import Card from "../Card";

export default function TeamCard() {
  const { structure } = useContext(StructureContext);
  const [isOpen, setIsOpen] = useState(false);
  const [team, setTeam] = useState([]);

  const getTeam = async (structureId) => {
    try {
      const query = { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structureId } }] } };
      const { responses } = await API.esQuery("referent", { query, size: ES_NO_LIMIT });
      if (responses.length) return responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
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
            </div>
          </div>
        </div>
      </Card>
      <TeamModal isOpen={isOpen} onCancel={() => setIsOpen(false)} team={team} setTeam={setTeam} />
    </>
  );
}
