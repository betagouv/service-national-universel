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
import { Field } from "formik";

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
      <Breadcrumbs items={[{ div: "Messages d'alerte" }]} />
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
          <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
            <div className="flex w-full flex-col gap-8">
              <div className="flex">
                <div className="flex w-[70%] flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-start gap-10 items-center text-gray-900 text-sm">
                      <div className="flex items-center justify-center gap-3">
                        <p className="text-xs  font-medium ">Type de message</p>
                        <MdInfoOutline data-tip data-for="identification" className="h-5 w-5 cursor-pointer text-gray-400" />
                        <ReactTooltip id="identification" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                          <p className=" w-[200px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Niveau de priorité du message.</p>
                        </ReactTooltip>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" />
                        <p className="pb-1">normal</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" />
                        <p className="pb-1">important</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" />
                        <p className="pb-1">urgent</p>
                      </div>
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
                        className="w-full"
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
                    <div className="flex w-full gap-4 border border-gray-200 rounded-lg p-1">
                      <textarea className="w-full h-[122px]" placeholder="Précisez en quelques mot" />
                    </div>
                  </div>
                </div>
                <div className="flex w-[10%] items-center justify-center">
                  <div className="h-[90%] w-[1px] border-r-[1px] border-gray-300"></div>
                </div>
                <div className="flex w-[20%] flex-col gap-4">
                  <div className="flex justify-end items-center">
                    <p className="text-gray-400 text-xs">Publié le 20/12/2022 à 22:22</p>
                  </div>
                  <div className="flex flex-col w-full justify-end items-center h-full gap-4">
                    <button className="border border-gray-300 text-gray-700 text-sm w-[226px] h-10 rounded-lg">Annuler</button>
                    <button className="border border-blue-600 bg-blue-600 text-white text-sm w-[226px] h-10 rounded-lg">Valider</button>
                    <button className="border border-red-500 text-red-500 text-sm w-[226px] h-10 rounded-lg">Supprimer ce message</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  function ModalMessage() {
    return (
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
          <div className="flex w-full flex-col gap-8">
            <div className="flex">
              <div className="flex w-[70%] flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-start gap-10 items-center text-gray-900 text-sm">
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-xs  font-medium ">Type de message</p>
                      <MdInfoOutline data-tip data-for="identification" className="h-5 w-5 cursor-pointer text-gray-400" />
                      <ReactTooltip id="identification" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                        <p className=" w-[200px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Niveau de priorité du message.</p>
                      </ReactTooltip>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" />
                      <p className="pb-1">normal</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" />
                      <p className="pb-1">important</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" />
                      <p className="pb-1">urgent</p>
                    </div>
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
                      className="w-full"
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
                  <div className="flex w-full gap-4 border border-gray-200 rounded-lg p-1">
                    <textarea className="w-full h-[122px]" placeholder="Précisez en quelques mot" />
                  </div>
                </div>
              </div>
              <div className="flex w-[10%] items-center justify-center">
                <div className="h-[90%] w-[1px] border-r-[1px] border-gray-300"></div>
              </div>
              <div className="flex w-[20%] flex-col gap-4">
                <div className="flex justify-end items-center">
                  <p className="text-gray-400 text-xs">Publié le 20/12/2022 à 22:22</p>
                </div>
                <div className="flex flex-col w-full justify-end items-center h-full gap-4">
                  <button className="border border-gray-300 text-gray-700 text-sm w-[226px] h-10 rounded-lg">Annuler</button>
                  <button className="border border-blue-600 bg-blue-600 text-white text-sm w-[226px] h-10 rounded-lg">Valider</button>
                  <button className="border border-red-500 text-red-500 text-sm w-[226px] h-10 rounded-lg">Supprimer ce message</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
