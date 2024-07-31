import React from "react";
import ReactTooltip from "react-tooltip";
import Select, { components } from "react-select";
import { toastr } from "react-redux-toastr";
import { MdInfoOutline } from "react-icons/md";

import { ROLES, translate, formatStringLongDate, AlerteMessageDto } from "snu-lib";

import api from "@/services/api";
import { capture } from "@/sentry";
import Field from "@/components/forms/Field";
import InfoMessage from "@/scenes/dashboardV2/components/ui/InfoMessage";

type ErrorForm = {
  priority?: string;
  to_role?: string;
  content?: string;
  title?: string;
};

interface Props {
  message?: AlerteMessageDto | null;
  isNew?: boolean;
  onIsNewChange?: (value: boolean) => void;
  onMessagesChange: () => void;
}

export default function AlerteMessageForm({ message, isNew, onIsNewChange, onMessagesChange }: Props) {
  const [editInfo, setEditInfo] = React.useState(isNew);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<ErrorForm>({});
  const [data, setData] = React.useState<Partial<AlerteMessageDto>>(message || {});

  const options = [
    { value: ROLES.ADMIN, label: "Modérateurs" },
    { value: ROLES.REFERENT_REGION, label: "Référents régionaux" },
    { value: ROLES.REFERENT_DEPARTMENT, label: "Référents départementaux" },
    { value: ROLES.SUPERVISOR, label: "Superviseurs" },
    { value: ROLES.RESPONSIBLE, label: "Responsables" },
    { value: ROLES.HEAD_CENTER, label: "Chefs de centre" },
  ];

  const selectCustomStyles = {
    control: (styles) => ({ ...styles, backgroundColor: "white" }),
    option: (styles, { isSelected }) => {
      return {
        ...styles,
        backgroundColor: isSelected ? "#f3f4f6" : "white",
        color: "black",
        fontWeight: isSelected ? "700" : "400",

        ":hover": {
          backgroundColor: "#f3f4f6",
        },
      };
    },
    placeholder: (styles) => {
      return {
        ...styles,
        color: "#9ca3af",
      };
    },
  };

  const InputOption = (props) => {
    return (
      <div>
        <components.Option {...props}>
          <input type="checkbox" checked={props.isSelected} onChange={() => null} /> <label>{props.label}</label>
        </components.Option>
      </div>
    );
  };

  const handleSubmitInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const errors: ErrorForm = {};

      if (!data.priority) errors.priority = "Ce champ est obligatoire";
      if (!data.to_role || data.to_role.length === 0) errors.to_role = "Ce champ est obligatoire";
      if (!data.title) errors.title = "Ce champ est obligatoire";
      if (data.title && data.title.length > 100) errors.content = "Ce champs est limité à 100 caractères";
      if (!data.content) errors.content = "Ce champ est obligatoire";
      if (data.content && data.content.length > 500) errors.content = "Ce champs est limité à 500 caractères";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      //Save data
      if (!data._id) {
        const { ok, code } = await api.post(`/alerte-message`, data);
        if (!ok) {
          toastr.error("Oups, une erreur est survenue lors de la modification du message", translate(code));
          return setIsLoading(false);
        }
        onMessagesChange();
      } else {
        const { ok, code } = await api.put(`/alerte-message/${data._id}`, data);

        if (!ok) {
          toastr.error("Oups, une erreur est survenue lors de la modification du message", translate(code));
          return setIsLoading(false);
        }
        setData(message || {});
        onMessagesChange();
      }
      setEditInfo(false);
      setIsLoading(false);
      setErrors({});
      if (isNew) onIsNewChange?.(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification du message", "");
      setIsLoading(false);
    }
  };

  const DeleteInfo = async () => {
    try {
      setIsLoading(true);
      //delete data
      const { ok, code } = await api.remove(`/alerte-message/${data._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression", translate(code));
        return setIsLoading(false);
      }
      onMessagesChange();
      setEditInfo(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression", "");
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    const shouldDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce message?");
    if (shouldDelete) {
      DeleteInfo();
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 mb-5">
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <div className="flex">
            <div className="flex w-[70%] flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-start gap-10 items-center text-gray-900 text-sm">
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-xs  font-medium ">Type de message</p>
                    <MdInfoOutline data-tip data-for="priority" className="h-5 w-5 cursor-pointer text-gray-400" />
                    {/* @ts-expect-error tooltipRadius exists */}
                    <ReactTooltip id="priority" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                      <p className="w-[200px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Niveau de priorité du message.</p>
                    </ReactTooltip>
                  </div>
                  <div className={`flex flex-row items-center justify-center gap-3 ${editInfo && "cursor-pointer"}`}>
                    <div
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          editInfo && setData({ ...data, priority: "normal" });
                        }
                      }}
                      onClick={() => editInfo && setData({ ...data, priority: "normal" })}>
                      <CheckBox value={data?.priority === "normal"} editInfo={editInfo} />
                    </div>
                    <div className="font-sm text-gray-900">normal</div>
                  </div>
                  <div className={`flex flex-row items-center justify-center gap-3 ${editInfo && "cursor-pointer"}`}>
                    <div
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          editInfo && setData({ ...data, priority: "important" });
                        }
                      }}
                      onClick={() => editInfo && setData({ ...data, priority: "important" })}>
                      <CheckBox value={data?.priority === "important"} editInfo={editInfo} />
                    </div>
                    <div className="font-sm text-gray-900">important</div>
                  </div>
                  <div className={`flex flex-row items-center justify-center gap-3 ${editInfo && "cursor-pointer"}`}>
                    <div
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          editInfo && setData({ ...data, priority: "urgent" });
                        }
                      }}
                      onClick={() => editInfo && setData({ ...data, priority: "urgent" })}>
                      <CheckBox value={data?.priority === "urgent"} editInfo={editInfo} />
                    </div>
                    <div className="font-sm text-gray-900">urgent</div>
                  </div>
                </div>
                {errors?.priority && <div className="text-[#EF4444]">{errors?.priority}</div>}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs  font-medium text-gray-900">Destinataire(s)</p>
                  <MdInfoOutline data-tip data-for="to_role" className="h-5 w-5 cursor-pointer text-gray-400" />
                  {/* @ts-expect-error tooltipRadius exists */}
                  <ReactTooltip id="to_role" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                    <p className=" w-[280px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Quel type d'utilisateur voulez-vous informer ?</p>
                  </ReactTooltip>
                </div>
                <div className="flex w-full gap-4">
                  <Select
                    placeholder="Sélectionnez le(s) destinataire(s)"
                    options={options}
                    maxMenuHeight={240}
                    isMulti
                    isDisabled={!editInfo}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    value={data.to_role?.map((role) => ({
                      value: role,
                      label: options.filter((item) => item.value === role)[0].label,
                    }))}
                    className="basic-multi-select w-full"
                    classNamePrefix="select"
                    components={{
                      Option: InputOption,
                    }}
                    onChange={(options) => {
                      setData({ ...data, to_role: options.map((opt) => opt.value) });
                    }}
                    styles={selectCustomStyles}
                  />
                </div>
                {errors?.to_role && <div className="text-[#EF4444]">{errors?.to_role}</div>}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-900">Titre du message</p>
                  <MdInfoOutline data-tip data-for="title" className="h-5 w-5 cursor-pointer text-gray-400" />
                  {/* @ts-expect-error tooltipRadius exists */}
                  <ReactTooltip id="title" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Titre du message d’information sur la vue générale du tableaux de bord aux utilisateurs concernés. 100 caractères max.
                    </p>
                  </ReactTooltip>
                </div>
                <div className="flex w-full gap-4">
                  <Field
                    name="title"
                    errors={errors}
                    row={2}
                    className="text-gray-900 w-full"
                    placeholder="Titre du message"
                    handleChange={(e) => setData({ ...data, title: e.target.value })}
                    value={data?.title}
                    readOnly={!editInfo}
                    type="textarea"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-900">Contenu du message</p>
                  <MdInfoOutline data-tip data-for="content" className="h-5 w-5 cursor-pointer text-gray-400" />
                  {/* @ts-expect-error tooltipRadius exists */}
                  <ReactTooltip id="content" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
                      Contenu du message d’information sur la vue générale du tableaux de bord aux utilisateurs concernés. 500 caractères max.
                    </p>
                  </ReactTooltip>
                </div>
                <div className="flex w-full gap-4">
                  <Field
                    name="content"
                    errors={errors}
                    className="text-gray-900  w-full"
                    placeholder="Précisez en quelques mots"
                    handleChange={(e) => setData({ ...data, content: e.target.value })}
                    value={data?.content}
                    readOnly={!editInfo}
                    type="textarea"
                  />
                </div>
              </div>
              {editInfo && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs  font-medium text-gray-900">Prévisualisation du message</p>
                  </div>
                  <InfoMessage title={data?.title} message={data?.content} priority={data?.priority} />
                </div>
              )}
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-[90%] w-[1px] border-r-[1px] border-gray-300"></div>
            </div>
            <div className="flex w-[20%] flex-col gap-4">
              {!isNew ? (
                <div className="flex justify-end items-center">
                  <p className="text-gray-400 text-xs">Publié le {formatStringLongDate(data.createdAt)}</p>
                </div>
              ) : null}
              <div className="flex flex-col w-full justify-end items-center h-full gap-4">
                {editInfo ? (
                  <>
                    <button
                      onClick={() => {
                        setEditInfo(false);
                        setData(message || {});
                        if (isNew) onIsNewChange?.(false);
                      }}
                      className="border border-gray-300 text-gray-700 text-sm w-[226px] h-10 rounded-lg"
                      disabled={!editInfo || isLoading}>
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmitInfo}
                      className="border border-blue-600 bg-blue-600 text-white text-sm w-[226px] h-10 rounded-lg"
                      disabled={!editInfo || isLoading}>
                      Valider
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditInfo(true);
                      }}
                      className="border border-blue-600 bg-blue-600 text-white text-sm w-[226px] h-10 rounded-lg"
                      disabled={isLoading}>
                      Modifier
                    </button>
                    <button onClick={handleDelete} className="border border-red-500 text-red-500 text-sm w-[226px] h-10 rounded-lg" disabled={isLoading}>
                      Supprimer ce message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckBox = ({ value, editInfo }) => {
  return (
    <>
      {value ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="checkbox"
          aria-label="checkbox-checked"
          aria-checked={true}
          tabIndex={editInfo ? 0 : 1}>
          <rect width="16" height="16" rx="8" fill="#2563EB" />
          <circle cx="8" cy="8" r="3" fill="white" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="checkbox"
          aria-label="checkbox-not-checked"
          aria-checked={false}
          tabIndex={editInfo ? 0 : 1}>
          <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" fill="white" />
          <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" stroke="#D1D5DB" />
        </svg>
      )}
    </>
  );
};
