import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { useAddress, PointDeRassemblementType } from "snu-lib";
import { AddressForm } from "@snu/ds/common";
// @ts-ignore
import { useDebounce } from "@uidotdev/usehooks";

import { Badge } from "@snu/ds/admin";

import { capture } from "@/sentry";
import api from "@/services/api";

import Breadcrumbs from "@/components/Breadcrumbs";
import Loader from "@/components/Loader";

import { Title } from "./components/common";
import Field from "./components/Field";

type PointDeRassemblementsForm = PointDeRassemblementType & {
  addressVerified?: boolean;
  complementAddress: Array<PointDeRassemblementType["complementAddress"][0] & { edit?: boolean }>;
};

export default function View(props) {
  const history = useHistory();

  const mount = React.useRef(false);

  const [pdr, setPdr] = React.useState<PointDeRassemblementsForm | null>(null);

  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });

  const loadPDR = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponsePDR } = await api.get(`/point-de-rassemblement/${id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement", code);
        return history.push("/point-de-rassemblement");
      }
      setPdr({ ...reponsePDR, addressVerified: true });

      return reponsePDR;
    } catch (e) {
      console.log(e);
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement", "");
    }
  };

  React.useEffect(() => {
    (async () => {
      if (mount.current === false) {
        await loadPDR();
        mount.current = true;
      }
    })();
  }, [props.match.params.id]);

  if (!pdr) return <Loader />;

  return (
    <>
      <Breadcrumbs
        items={[{ title: "Séjours" }, { label: "Point de rassemblement", to: "/point-de-rassemblement/liste/liste-points" }, { label: "Fiche point de rassemblement" }]}
      />
      <div className="m-8 flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Title>{pdr.name}</Title>
          {pdr.deletedAt && <Badge title="Archivé" status="WAITING_CORRECTION" />}
        </div>
        {/* INFOS */}
        <div className="flex flex-col gap-8 rounded-lg bg-white px-8 pt-8 pb-12">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
          </div>
          <div className="flex">
            <div className="flex w-[45%] flex-col gap-4 ">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Désignation du point de rassemblement</div>
                <Field label="Désignation du point de rassemblement" value={pdr.name} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Matricule</div>
                <Field label="Matricule" value={pdr.matricule || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Académie</div>
                <Field label="Académie" value={pdr.academie} disabled />
              </div>
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
            </div>
            <div className="flex w-[45%] flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>

                <AddressForm readOnly data={{ address: pdr.address, zip: pdr.zip, city: pdr.city }} updateData={() => false} query={query} setQuery={setQuery} options={results} />
                <div className="flex items-center gap-3">
                  <Field label="Département" value={pdr.department} disabled />
                  <Field label="Région" value={pdr.region} disabled />
                </div>
                <div>
                  <Field label="Particularités d'accès" value={pdr.particularitesAcces || ""} disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
