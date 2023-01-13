import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader, Loading } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import { BorderButton, PlainButton } from "../../components/Buttons";
import People from "../../../../assets/icons/People";
import api from "../../../../services/api";
import IcebergColor from "../../../../assets/icons/IcebergColor";
import MapColor from "../../../../assets/icons/MapColor";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";

export default function GroupAffectationSummary({ group, className = "", onChange, onChangeStep }) {
  const { user } = useSelector((state) => state.Auth);
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
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.MODIFICATION)} noBack={[ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(user.role)}>
        <div className="grow flex items-center justify-between">
          <div className="">Récapitulatif</div>
          <div className="flex items-center text-base text-gray-900">
            <People className="mx-[5px] text-[#9CA3AF]" />
            {group.youngsVolume}
          </div>
        </div>
      </GroupHeader>
      <div className="mt-[20px] border-y-[1px] border-y-[#E5E7EB] px-[16px] py-[30px]">
        <div className="">Vous vous apprêtez à affecter {group.youngsVolume} volontaires aux lieux suivants :</div>
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-[#DC5318]">{error}</div>
        ) : (
          <>
            <div className="flex items-start mt-4">
              <IcebergColor className="w-[50px] mr-4" />
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
            <div className="flex items-start mt-4">
              <MapColor className="w-[50px] h-[50px] mr-4" />
              <div className="grow">
                <div className="text-lg font-bold text-[#242526]">Lieux de rassemblement</div>
                {detail.gatheringPlaces && detail.gatheringPlaces.length > 0 ? (
                  <ul className="list-outside ml-3">
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
      {![ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(user.role) && (
        <div className="flex items-end justify-center pt-[67px]">
          <BorderButton onClick={() => onChangeStep(GROUPSTEPS.MODIFICATION)} className="mr-[8px]">
            Annuler
          </BorderButton>
          <PlainButton onClick={() => onChange(group, GROUPSTEPS.CANCEL)}>Valider cette affectation</PlainButton>
        </div>
      )}
    </GroupBox>
  );
}
