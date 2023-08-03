import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import logo from "../../assets/logo-snu.png";
import Breadcrumbs from "../../components/Breadcrumbs";
import { capture } from "../../sentry";
import api from "../../services/api";
import { AiOutlinePlus } from "react-icons/ai";
import { translate } from "snu-lib";
import ModalAlerteMess from "./components/ModalAlerteMess";
import { ROLES } from "snu-lib";

export default function Alerte() {
  const { user } = useSelector((state) => state.Auth);
  const [data, setData] = useState([]);
  const [isNew, setIsNew] = useState(false);

  const getMessage = async () => {
    try {
      const { ok, code, data: response } = await api.get(`/alerte-message/all`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
      }
      setData(response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des messages");
    }
  };

  React.useEffect(() => {
    getMessage();
  }, []);

  React.useEffect(() => {
    setData([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [isNew]);

  if (user.role !== ROLES.ADMIN)
    return (
      <div className="h-100 m-6 flex flex-col items-center justify-center">
        <img src={logo} alt="logo" className="w-56 pb-8" />
        <div className="pb-4 text-center text-3xl">Vous n&apos;avez pas les droits d&apos;accès à cette page !</div>
        <div className="mt-4 text-center text-lg text-gray-500">
          Besoin d&apos;aide ?{" "}
          <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="scale-105 cursor-pointer hover:underline">
            Cliquez ici
          </a>
        </div>
      </div>
    );

  return (
    <>
      <Breadcrumbs items={[{ label: "Messages d'alerte" }]} />
      <div className="flex w-full flex-col px-8 pb-8">
        <div className="flex items-center justify-between py-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Messages d'alerte</div>
          <button
            className="flex w-[241px] h-[38px] justify-center items-center text-blue-600 border border-blue-600 rounded-md text-sm font-medium"
            style={{ borderColor: "#2563EB" }}
            onClick={() => setIsNew(true)}>
            <AiOutlinePlus style={{ width: "20px", height: "20px" }} className="pt-1" />
            &#8239;Créer un nouveau message
          </button>
        </div>
        {!data?.length && !isNew ? <p>Aucun message d'alerte n'est paramétré pour le moment.</p> : null}
        {isNew ? <ModalAlerteMess message={null} isNew={isNew} setIsNew={setIsNew} setMessageList={setData} /> : null}
        {data?.length ? data.map((hit) => <ModalAlerteMess key={hit._id} message={hit} setMessageList={setData} />) : null}
      </div>
    </>
  );
}
