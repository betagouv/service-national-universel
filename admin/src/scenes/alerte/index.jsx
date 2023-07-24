import React from "react";
import { MdInfoOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { isSuperAdmin, ROLES } from "snu-lib";
import logo from "../../assets/logo-snu.png";
import Breadcrumbs from "../../components/Breadcrumbs";
import ButtonPrimary from "../../components/ui/buttons/ButtonPrimary";
import { capture } from "../../sentry";
import api from "../../services/api";
import DatePickerInput from "../../components/ui/forms/dateForm/DatePickerInput";
import InputText from "../../components/ui/forms/InputText";
import InputTextarea from "../../components/ui/forms/InputTextarea";
import Select from "react-select";
import SimpleToggle from "../../components/ui/forms/dateForm/SimpleToggle";
import ToggleDate from "../../components/ui/forms/dateForm/ToggleDate";
import { BiLoaderAlt } from "react-icons/bi";
import NumberInput from "../../components/ui/forms/NumberInput";
import { AiOutlinePlus } from "react-icons/ai";
import InfoCircle from "../../assets/icons/InfoCircle";

export default function Alerte() {
  const { user } = useSelector((state) => state.Auth);

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
            style={{ borderColor: "#2563EB" }}>
            <AiOutlinePlus style={{ width: "20px", height: "20px" }} className="pt-1" />
            &#8239;Créer un nouveau message
          </button>
        </div>
        <div className="flex w-full flex-col gap-8">
          {/* Informations générales */}
          <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex w-full flex-col gap-8">
              <div className="flex">
                <div className="flex w-[45%] flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Type de message</p>
                      <MdInfoOutline data-tip data-for="identification" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="identification" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Niveau de priorité du message.</p>
                      </ReactTooltip>
                      <label>
                        <input type="checkbox" />
                        <span>normal</span>
                      </label>
                      <label>
                        <input type="checkbox" />
                        <span>important</span>
                      </label>
                      <label>
                        <input type="checkbox" />
                        <span>urgent</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Destinataire(s)</p>
                      <MdInfoOutline data-tip data-for="dates_du_séjour" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="dates_du_séjour" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Quel type d'utilisateur voulez-vous informer ?</p>
                      </ReactTooltip>
                    </div>
                    <div className="flex w-full gap-4">
                      <Select
                        placeholder="Sélectionnez le(s) destinataire(s)"
                        maxMenuHeight={240}
                        styles={{
                          placeholder: (styles) => ({ ...styles, color: "#6B7280" }),
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-xs  font-medium text-gray-900">Contenu du message</p>
                      <MdInfoOutline data-tip data-for="dates_du_séjour" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="dates_du_séjour" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                        <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                          Affichage d’un message d’information sur la vue générale du tableaux de bord aux utilisateurs concernés.
                        </p>
                      </ReactTooltip>
                    </div>
                    <div className="flex w-full gap-4">
                      <textarea className="h-[122px] w-full" />
                    </div>
                  </div>
                </div>
                <div className="flex w-[10%] items-center justify-center">
                  <div className="h-[90%] w-[1px] border-r-[1px] border-gray-200"></div>
                </div>
                <div className="flex w-[45%] flex-col gap-4">
                    <p>Publié le 20/12/2022 à 22:22</p>
                  <button>Annuler</button>
                  <button>Valider</button>
                  <button>Supprimer ce message</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

{
  /* <div className="flex w-full flex-col gap-8">
  <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
    <div>
      <div>
        <p>Type de message</p>
        <InfoCircle />
      </div>
      <label>
        <input type="checkbox" />
        <span></span>
      </label>
      <label>
        <input type="checkbox" />
        <span>important</span>
      </label>
      <label>
        <input type="checkbox" />
        <span>urgent</span>
      </label>
    </div>

    <div>
      <div>
        <p>Destinaitaire(s)</p>
        <InfoCircle />
      </div>
      <Select
        placeholder="Sélectionnez le(s) destinataire(s)"
        maxMenuHeight={240}
        styles={{
          placeholder: (styles) => ({ ...styles, color: "#6B7280" }),
        }}
      />
    </div>

    <div>
      <div>
        <p>Contenu du message</p>
        <InfoCircle />
      </div>
      <textarea className="h-[122px] w-full" />
    </div>
  </div>
</div>; */
}
