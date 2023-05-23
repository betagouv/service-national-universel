import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader, GroupMenuItem, Loading } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import People from "../../../../assets/icons/People";
import api from "../../../../services/api";
import IcebergColor from "../../../../assets/icons/IcebergColor";
import MapColor from "../../../../assets/icons/MapColor";

export default function GroupModificationEnhanced({ group, className = "", onChangeStep }) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async function () {
      setLoading(true);
      setError(null);
      try {
        const result = await api.post("/schema-de-repartition/get-group-detail", group);
        if (result.ok) {
          setDetail(result.data);
        } else {
          setError("Nous n'avons pas réussi à charger les détails de l'affectation. Veuillez réessayer plus tard.");
        }
      } catch (err) {
        setError("Nous n'avons pas réussi à charger les détails de l'affectation. Veuillez réessayer plus tard.");
      }
      setLoading(false);
    })();
  }, [group]);

  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.CANCEL)}>
        <div className="flex grow items-center justify-between">
          <div className="">Modifier un groupe</div>
          <div className="flex items-center text-base text-gray-900">
            <People className="mx-[5px] text-[#9CA3AF]" />
            {group.youngsVolume}
          </div>
        </div>
      </GroupHeader>
      <div className="border-y-[1px] border-y-[#E5E7EB] px-[16px] pb-[10px]">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-[#DC5318]">{error}</div>
        ) : (
          <>
            <div className="mt-4 flex items-start">
              <IcebergColor className="mr-4 w-[50px]" />
              <div className="grow">
                <div className="text-lg font-bold text-[#242526]">Centre de cohésion</div>
                <div className="text-sm text-gray-800">
                  {detail.center ? (
                    <span>
                      {detail.center.name}, {detail.center.address} {detail.center.zip} {detail.center.city}&nbsp;•&nbsp;{detail.center.department}
                    </span>
                  ) : (
                    <span className="opacity-50">Pas de centre sélectionné.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start">
              <MapColor className="mr-4 h-[50px] w-[50px]" />
              <div className="grow">
                <div className="text-lg font-bold text-[#242526]">Lieux de rassemblement</div>
                {detail.gatheringPlaces && detail.gatheringPlaces.length > 0 ? (
                  <ul className="ml-3 list-outside">
                    {detail.gatheringPlaces.map((pdr) => (
                      <li key={pdr._id} className="text-sm text-gray-800">
                        {pdr.name}, {pdr.address} {pdr.zip} {pdr.city}&nbsp;•&nbsp;{pdr.department}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="opacity-50">Aucun point de rassemblement sélectionné.</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-[20px] ">
        <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.YOUNG_COUNTS)}>Modifier le nombre de volontaires</GroupMenuItem>
        {group.centerId ? (
          <>
            <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CENTER)}>Modifier l&apos;affectation</GroupMenuItem>
            <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CONFIRM_DELETE_CENTER)}>Passer en attente d&apos;affectation</GroupMenuItem>
          </>
        ) : (
          <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CENTER)}>Affecter les volontaires</GroupMenuItem>
        )}
        {group.gatheringPlaces && group.gatheringPlaces.length > 0 && (
          <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.GATHERING_PLACES)}>Modifier les lieux de rassemblements</GroupMenuItem>
        )}
        <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CONFIRM_DELETE_GROUP)}>Supprimer le groupe</GroupMenuItem>
      </div>
    </GroupBox>
  );
}
