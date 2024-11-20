import React, { useState } from "react";
import { BiHandicap } from "react-icons/bi";
// @ts-expect-error lib non ts
import { useDebounce } from "@uidotdev/usehooks";
import ReactTooltip from "react-tooltip";
import { HiOutlineInformationCircle } from "react-icons/hi";

import { Badge, InputText } from "@snu/ds/admin";
import Loader from "@/components/Loader";
import { useAddress, CohesionCenterType, translate } from "snu-lib";
import { AddressForm } from "@snu/ds/common";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import { Title } from "../components/commons";
import Toggle from "../components/Toggle";

export default function Details({ center }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });
  const [data, setData] = useState<CohesionCenterType>({ ...center, pmr: center?.pmr ? center.pmr : "false" });
  useDocumentTitle(`Fiche du centre - ${center?.name}`);

  if (!data) return <Loader />;
  console.log(data);
  return (
    <div className="m-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Title>{data.name}</Title>
        {data?.deletedAt && <Badge title="Archivé" status="WAITING_CORRECTION" />}
      </div>
      <div className="flex flex-col gap-8 rounded-lg bg-white px-8 pt-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
          <div className="flex items-center text-xs leading-4 font-medium text-gray-500">
            <p>Modifier ces informations ?</p>
            <HiOutlineInformationCircle data-tip="" data-for="tooltip-modif" className="ml-2 mt-0.5" size={20} />
            <ReactTooltip id="tooltip-modif" className="bg-white shadow-xl" arrowColor="white" disable={false} place="top">
              <div className="text-gray-700 text-xs font-[400] w-[260px] text-center">Les modifications se font uniquement dans le module de répartition SI SNU.</div>
            </ReactTooltip>
          </div>
        </div>
        <div className="flex">
          <div className="flex w-[45%] flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div>Désignations</div>
              <div className="flex flex-col gap-2 bg-gray-50">
                <p>
                  Nom du Centre : <span>{data.name}</span>
                </p>
                <p>
                  Code : <span>{data.matricule}</span>
                </p>
                <p>
                  Désignation : <span>{data.centerDesignation}</span>
                </p>
                <p>
                  Typologie : <span>{data.typology}</span>
                </p>
                <p>
                  Domaine : <span>{data.domain}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex">
                <div>Capacité maximale d'accueil</div>
                <HiOutlineInformationCircle data-tip="" data-for="tooltip-capacite" className="ml-2 mt-0.5" size={20} />
                <ReactTooltip id="tooltip-capacite" className="bg-white shadow-xl" arrowColor="white" disable={false} place="top">
                  <div className="text-gray-700 text-xs font-[400] w-[260px] text-center">Les modifications se font uniquement dans le module de répartition SI SNU.</div>
                </ReactTooltip>
              </div>
              <div className="bg-gray-50">{data.placesTotal}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div>Capacité maximale d'accueil</div>
              <div className="bg-gray-50">{translate(data.pmr)}</div>
            </div>
          </div>
          <div className="flex w-[10%] items-center justify-center">
            <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex w-[45%] flex-col  justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div>Gestionnaire ou propriétaire</div>
                <div className="bg-gray-50">{data.complement && data.complement !== "" ? data.complement : "Non renseigné"}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div>Adresse</div>
                <div className="flex flex-col gap-2 bg-gray-50">
                  <p>{data.address}</p>
                  <p>
                    {data.zip}
                    {data.city}
                  </p>
                  <div className="flex flex-col gap-2 bg-gray-50">
                    <p>
                      Département : <span>{data.department}</span>
                    </p>
                    <p>
                      Région : <span>{data.region}</span>
                    </p>
                    <p>
                      Académie : <span>{data.academy}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
