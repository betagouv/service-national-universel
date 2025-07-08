import React, { Fragment, useEffect, useState } from "react";
import { HiMinus, HiX, HiOutlineDotsHorizontal, HiOutlineDuplicate } from "react-icons/hi";

import { nanoid } from "nanoid";

import API from "../../services/api";
import Modal from "./components/Modal";
import { TH } from "../../components/Table";

import { SOURCES } from "../../constants";
import {
  translateRole,
  translateSource,
  translateState,
  translateVentilationOperator,
  translateVentilationField,
  translateVentilationFieldAction,
  filterObjectByKeys,
} from "../../utils";
import { departmentList, regionList } from "@/utils";

import { toast } from "react-hot-toast";
import Toggle from "./components/Toggle";
import { useHistory } from "react-router-dom";

function serializeVentilation(source) {
  const ventilation = filterObjectByKeys(source, ["name", "description", "active"]);
  if (source.conditionsEt) {
    ventilation.conditionsEt = source.conditionsEt.map((i) => filterObjectByKeys(i, ["field", "operator", "value"]));
  }
  if (source.conditionsOu) {
    ventilation.conditionsOu = source.conditionsOu.map((i) => filterObjectByKeys(i, ["field", "operator", "value"]));
  }
  if (source.actions) {
    ventilation.actions = source.actions.map((i) => filterObjectByKeys(i, ["action", "field", "value"]));
  }
  return ventilation;
}

export default function VentilationAutomation() {
  const [ventilationRules, setVentilationRules] = useState([]);

  const [open, setOpen] = useState(false);

  const update = async () => {
    try {
      const { ok, data } = await API.get({ path: "/ventilation" });
      if (ok) setVentilationRules(data);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateVentilation = async (ventilation) => {
    const body = serializeVentilation(ventilation);
    try {
      const { ok } = await API.patch({ path: `/ventilation/${ventilation._id}`, body });
      if (ok) {
        await update();
        toast.success("La régle de ventilation a été modifiée");
        setTimeout(() => {
          history.go();
        }, 1000);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteVentilation = async (ventilation) => {
    try {
      const { ok } = await API.delete({ path: `/ventilation/${ventilation._id}` });
      if (ok) {
        await update();
        toast.success("La régle de ventilation a été supprimée");
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    update();
  }, []);

  return (
    <Fragment>
      <Table ventilationRules={ventilationRules} open={open} setOpen={setOpen} updateVentilation={updateVentilation} deleteVentilation={deleteVentilation} />
    </Fragment>
  );
}

const Header = ({ folders, agents, tags }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-[38px] flex items-center justify-between pl-[22px]">
      <ModalContent open={open} setOpen={setOpen} ventilation={null} folders={folders} agents={agents} tags={tags} />
      <div>
        <span className="text-sm font-medium uppercase text-gray-500">Tickets</span>
        <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Ventilation et automatisation</h4>
      </div>
      <button type="button" className="h-[38px] rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500" onClick={() => setOpen(true)}>
        Nouveau
      </button>
    </div>
  );
};

const Table = ({ ventilationRules, updateVentilation, deleteVentilation }) => {
  const [agents, setAgents] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);

  const getAgents = async () => {
    try {
      const { ok, data } = await API.get({ path: "/agent" });
      if (ok) setAgents(data.AGENT);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getFolders = async () => {
    try {
      const { ok, data } = await API.get({ path: "/folder/all" });
      if (ok) setFolders(data);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getTags = async () => {
    try {
      const { ok, data } = await API.get({ path: "/tag" });
      if (ok) {
        setTags(data.map(({ _id, name }) => ({ _id: _id, label: name })).sort((tag1, tag2) => (tag1.label < tag2.label ? -1 : 1)));
      } else {
        toast.error("Erreur lors de la récupération des étiquettes");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des étiquettes");
    }
  };

  useEffect(() => {
    getAgents();
    getFolders();
    getTags();
  }, []);

  return (
    <>
      <Header agents={agents} folders={folders} tags={tags} />
      <Fragment>
        <div className="mb-28 max-w-full rounded-lg bg-white shadow">
          <div className="grid grid-cols-[100px_1fr_100px_100px_120px] rounded-t-lg border-b border-gray-200 bg-gray-50">
            <TH text="Règle" />
            <TH text="description" />
            <TH text="Créé par" />
            <TH text="Volume de messages" className=" flex-none" />
            <TH text="Actif" className=" flex-none" />
          </div>

          <div className="flex flex-col">
            {ventilationRules.map((ventilationRule) => (
              <VentilationRule
                agents={agents}
                folders={folders}
                tags={tags}
                ventilationRule={ventilationRule}
                key={ventilationRule._id}
                deleteVentilation={deleteVentilation}
                updateVentilation={updateVentilation}
              />
            ))}
          </div>
        </div>
      </Fragment>
    </>
  );
};

const addIdToObject = (object) => {
  return { ...object, id: nanoid() };
};

const defaultCondition = { field: "", operator: "", value: "" };
const defaultAction = { field: "", value: "", action: "SET" };
const defaultConditions = [];
const defaultActions = [];

const ModalContent = ({ open, setOpen, ventilation, isUpdate, agents, tags, folders }) => {
  const [active, setActive] = useState(ventilation?.active ?? false);
  const [name, setName] = useState(ventilation?.name);
  const [description, setDescription] = useState(ventilation?.description);
  const [conditionsEt, setConditionsEt] = useState(ventilation?.conditionsEt && ventilation?.conditionsEt.length > 0 ? ventilation?.conditionsEt : defaultConditions);
  const [conditionsOu, setConditionsOu] = useState(ventilation?.conditionsOu && ventilation?.conditionsOu.length > 0 ? ventilation?.conditionsOu : defaultConditions);
  const [actions, setActions] = useState(ventilation?.actions && ventilation?.actions.length > 0 ? ventilation?.actions : defaultActions);

  const history = useHistory();

  const checkCondition = (condition) => {
    const { field, operator, value } = condition;
    if (!field || !operator || !value) return false;
    const conditionRender = conditionsRender.find((render) => render.field === field);
    if (!conditionRender) return false;
    if (!conditionRender.operator.includes(operator)) return false;
    if (conditionRender.values.length > 0 && !(conditionRender.values.includes(value) || conditionRender.values.some((v) => v._id === value))) return false;

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!name || !description) return toast.error("Veuillez remplir le nom et la description de la régle de ventilation.");
      if (conditionsEt.length === 0 && conditionsOu.length === 0) return toast.error("Veuillez ajouter au moins une condition.");
      if (actions.length === 0) return toast.error("Veuillez ajouter au moins une action.");

      const conditionsEtValid = conditionsEt.every((condition) => checkCondition(condition));
      const conditionsOuValid = conditionsOu.every((condition) => checkCondition(condition));
      // Check if each action exists in actionsRender
      const actionsValid = actions.every((condition) => {
        const { field, value } = condition;
        const actionRender = actionsRender.find((render) => render.field === field);
        if (!actionRender) return false;
        if (actionRender.values.length > 0 && !(actionRender.values.includes(value) || actionRender.values.some((v) => v._id === value))) return false;
        return true;
      });

      if (!conditionsEtValid || !conditionsOuValid) {
        return toast.error("Veuillez sélectionner des conditions valides.");
      }
      if (!actionsValid) {
        return toast.error("Veuillez sélectionner des actions valides.");
      }

      const body = serializeVentilation({ name, description, conditionsEt, conditionsOu, actions, active });

      const { ok } = !isUpdate ? await API.post({ path: "/ventilation", body }) : await API.patch({ path: `/ventilation/${ventilation._id}`, body });
      if (ok) {
        !isUpdate ? toast.success("Ventilation créée") : toast.success("Ventilation modifiée");
        history.go();
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const conditionsRender = [
    { field: "status", operator: ["is", "is not"], valuesType: "select", values: ["NEW", "OPEN", "CLOSED", "PENDING", "DRAFT"] },
    { field: "number", operator: ["smaller", "greater"], valuesType: "range", values: [] },
    { field: "subject", operator: ["contains", "not contains"], valuesType: "input", values: [] },
    { field: "agentId", operator: ["is", "is not"], valuesType: "select", values: agents },
    { field: "createdAt", operator: ["smaller", "greater"], valuesType: "dateSelect", values: [] },
    { field: "updatedAt", operator: ["smaller", "greater"], valuesType: "dateSelect", values: [] },
    { field: "tags", operator: ["contains", "not contains"], valuesType: "input", values: [] },
    { field: "textMessage", operator: ["contains", "not contains"], valuesType: "input", values: [] },
    { field: "lastUpdateAgent", operator: ["is", "is not"], valuesType: "select", values: agents },
    { field: "contactGroup", operator: ["is", "is not"], valuesType: "select", values: Object.keys(translateRole) },
    { field: "contactEmail", operator: ["contains", "not contains"], valuesType: "input", values: [] },
    { field: "source", operator: ["is", "is not"], valuesType: "select", values: Object.keys(SOURCES) },
    { field: "contactDepartment", operator: ["is", "is not"], valuesType: "select", values: departmentList },
    { field: "contactRegion", operator: ["is", "is not"], valuesType: "select", values: regionList },
  ];

  const actionsRender = [
    { field: "status", values: ["NEW", "OPEN", "CLOSED", "PENDING", "DRAFT"], action: "SET" },
    { field: "agentId", values: agents, action: "SET" },
    { field: "foldersId", values: folders, action: "SET" },
    { field: "tag", values: tags, action: "SET" },
  ];

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Edition de la règle de ventilation</h5>
      <div className="mb-7">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Nom de la règle*</label>
        <input
          type="text"
          className="w-full rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom de la règle*"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </div>

      <div className="mb-9">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Description*</label>
        <input
          type="text"
          className="w-full rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
      </div>

      <div className="mb-12">
        <label className=" mb-0.5 inline-block w-full text-sm font-medium text-gray-700">Tickets concernés ET</label>
        <span className="mb-4 inline-block w-full text-sm text-grey-text">Qui respectent tous les critères ci-dessous (ET).</span>
        {conditionsEt?.map((conditionSelected, key) => (
          <Condition
            conditionsRender={conditionsRender}
            conditionSelected={conditionSelected}
            key={conditionSelected._id || conditionSelected.id}
            onChange={(e) => setConditionsEt(conditionsEt.map((c, k) => (k === key ? e : c)))}
            onDuplicate={() => {
              let newConditions = JSON.parse(JSON.stringify(conditionsEt));
              const selectedCondition = newConditions[key]; // Get the selected condition
              delete selectedCondition._id; // Remove the existing ID property
              // Create a new condition with a different ID
              const duplicatedCondition = addIdToObject(selectedCondition);
              newConditions.splice(key + 1, 0, duplicatedCondition); // Insert the duplicated condition
              setConditionsEt(newConditions);
            }}
            onDelete={() => {
              let newConditions = JSON.parse(JSON.stringify(conditionsEt));
              newConditions.splice(key, 1);
              setConditionsEt(newConditions);
            }}
          />
        ))}
        <button
          type="button"
          className="h-[38px] w-full flex-1 rounded-md bg-gray-500  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-gray-400"
          onClick={() => {
            let newConditions = JSON.parse(JSON.stringify(conditionsEt));
            newConditions.push(addIdToObject(defaultCondition)); // Add a new condition with a different ID
            setConditionsEt(newConditions);
          }}
        >
          Ajouter une condition
        </button>
      </div>

      <div className="mb-12">
        <label className=" mb-0.5 inline-block w-full text-sm font-medium text-gray-700">Tickets concernés OU</label>
        <span className="mb-4 inline-block w-full text-sm text-grey-text">Qui respectent un des critères ci-dessous (OU).</span>

        {conditionsOu.map((conditionSelected, key) => (
          <Condition
            conditionsRender={conditionsRender}
            conditionSelected={conditionSelected}
            key={conditionSelected._id || conditionSelected.id}
            onChange={(e) => setConditionsOu(conditionsOu.map((c, k) => (k === key ? e : c)))}
            onDuplicate={() => {
              let newConditions = JSON.parse(JSON.stringify(conditionsOu));
              const selectedCondition = newConditions[key]; // Get the selected condition
              delete selectedCondition._id; // Remove the existing ID property
              // Create a new condition with a different ID
              const duplicatedCondition = addIdToObject(selectedCondition);
              newConditions.splice(key + 1, 0, duplicatedCondition); // Insert the duplicated condition
              setConditionsOu(newConditions);
            }}
            onDelete={() => {
              let newConditions = JSON.parse(JSON.stringify(conditionsOu));
              if (conditionsOu.size === 1) newConditions.splice(key, 1, addIdToObject(defaultCondition));
              newConditions.splice(key, 1);
              setConditionsOu(newConditions);
            }}
          />
        ))}
        <button
          type="button"
          className="h-[38px] w-full flex-1 rounded-md bg-gray-500  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-gray-400"
          onClick={() => {
            let newConditions = JSON.parse(JSON.stringify(conditionsOu));
            newConditions.push(addIdToObject(defaultCondition)); // Add a new condition with a different ID
            setConditionsOu(newConditions);
          }}
        >
          Ajouter une condition
        </button>
      </div>

      <div className="mb-10">
        <label className="mb-0.5 inline-block w-full text-sm font-medium text-gray-700">Règle de ventilation</label>
        <span className="mb-4 inline-block w-full text-sm text-grey-text">Ce que l’outil doit faire des tickets</span>
        {actions.map((actionSelected, key) => (
          <Actions
            actionsRender={actionsRender}
            actionSelected={actionSelected}
            key={actionSelected._id || actionSelected.id}
            onChange={(e) => {
              setActions(actions.map((c, k) => (k === key ? e : c)));
            }}
            onDuplicate={() => {
              let newActions = JSON.parse(JSON.stringify(actions));
              const selectedAction = newActions[key]; // Get the selected condition
              delete selectedAction._id; // Remove the existing ID property
              // Create a new condition with a different ID
              const duplicatedAction = addIdToObject(selectedAction);
              newActions.splice(key + 1, 0, duplicatedAction); // Insert the duplicated condition
              setActions(newActions);
            }}
            onDelete={() => {
              let newActions = JSON.parse(JSON.stringify(actions));
              if (actions.size === 1) newActions.splice(key, 1, addIdToObject(defaultAction));
              newActions.splice(key, 1);
              setActions(newActions);
            }}
          />
        ))}
        <button
          type="button"
          className="h-[38px] w-full flex-1 rounded-md bg-gray-500  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-gray-400"
          onClick={() => {
            let newActions = JSON.parse(JSON.stringify(actions));
            newActions.push(addIdToObject(defaultActions)); // Add a new condition with a different ID
            setActions(newActions);
          }}
        >
          Ajouter une action
        </button>
      </div>

      <div className="mb-9 flex  gap-2.5 ">
        <Toggle enabled={active} setEnabled={setActive} />
        <span className="text-base font-medium text-gray-700">Règle active</span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-custom-red transition-colors hover:bg-red-50"
          onClick={() => setOpen(false)}
        >
          Annuler
        </button>
        {isUpdate ? (
          <button
            type="button"
            className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            onClick={() => handleSubmit()}
          >
            Modifier
          </button>
        ) : (
          <button
            type="button"
            className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            onClick={() => handleSubmit()}
          >
            Enregistrer
          </button>
        )}
      </div>
    </Modal>
  );
};

const Condition = ({ conditionsRender, conditionSelected, onChange, onDuplicate, onDelete }) => {
  const [field, setField] = useState(conditionSelected.field);
  const [operator, setOperator] = useState(conditionSelected.operator);
  const [value, setValue] = useState(conditionSelected.value);

  const conditionRender = conditionsRender.find((elem) => elem.field === field);

  const handleFieldChange = (field) => {
    setField(field);
    const newConditionRender = conditionsRender.find((elem) => elem.field === field);
    const operator = newConditionRender.operator[0];
    setOperator(operator);
    const value = "";
    setValue(value);
    onChange({ ...conditionSelected, field, operator, value });
  };

  const handleOperatorChange = (operator) => {
    setOperator(operator);
    if (value !== "" ? setValue(value) : setValue(""));
    onChange({ ...conditionSelected, field, operator, value });
  };

  const handleValueChange = (value) => {
    setValue(value);
    onChange({ ...conditionSelected, field, operator, value });
  };

  return (
    <div className="mb-3 flex flex-col gap-[26px]">
      <div className="flex items-center gap-4">
        <select
          type="text"
          className="w-1/4 flex-1 rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Champ"
          onChange={(e) => {
            handleFieldChange(e.target.value);
          }}
          value={field}
        >
          <option key={0} hidden>
            Sélectionner une condition
          </option>
          {conditionsRender?.map((conditionValue, index) => (
            <option key={index} value={conditionValue.field}>
              {translateVentilationField[conditionValue.field]}
            </option>
          ))}
        </select>
        <select
          type="text"
          className={`w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${
            field === "" ? "hidden" : 0
          } `}
          placeholder="Condition"
          value={operator}
          onChange={(e) => handleOperatorChange(e.target.value)}
          disabled={!field}
        >
          {conditionRender?.operator?.map((operatorValue, index) => (
            <option key={index} value={operatorValue}>
              {translateVentilationOperator[operatorValue]}
            </option>
          ))}
        </select>
        {
          {
            status: (
              <select
                type="text"
                className="w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Statut"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <option key={0} hidden>
                  Choisir status
                </option>
                {conditionRender?.values?.map((status, index) => (
                  <option key={index + 1} value={status}>
                    {translateState[status]}
                  </option>
                ))}
              </select>
            ),
            agentId: (
              <select
                type="text"
                className="w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Agent"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <option key={0} className="text-gray-300" hidden>
                  Choisir agent
                </option>
                {conditionRender?.values?.map((agent, index) => (
                  <option key={index + 1} value={`${agent._id}`}>{`${agent.firstName} ${agent.lastName}`}</option>
                ))}
              </select>
            ),
            subject: (
              <input
                type="text"
                className="w-1/4  rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Titre du ticket"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            ),
            tags: (
              <input
                type="text"
                className="w-1/4  rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Tag du ticket"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            ),
            createdAt: (
              <input
                type="datetime-local"
                className="w-1/4 rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder=""
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            ),
            updatedAt: (
              <input
                type="datetime-local"
                className="w-1/4 rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder=""
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            ),
            number: (
              <input
                type="input"
                className="w-1/4 rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Numéro du ticket"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            ),
            textMessage: (
              <input
                type="input"
                className="w-1/4 rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Contenu du message"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            ),
            lastUpdateAgent: (
              <select
                type="text"
                className="w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Agent"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <option key={0} selected hidden>
                  Choisir agent
                </option>
                {conditionRender?.values?.map((agent, index) => (
                  <option key={index + 1} value={`${agent._id}`}>{`${agent.firstName} ${agent.lastName}`}</option>
                ))}
              </select>
            ),
            contactGroup: (
              <select
                type="text"
                className="w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Groupe de contact"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <option key={0} hidden>
                  Choisir groupe
                </option>
                {conditionRender?.values?.map((contactGroup, index) => (
                  <option key={index + 1} value={`${contactGroup}`}>{`${translateRole[contactGroup]}`}</option>
                ))}
              </select>
            ),
            source: (
              <select
                type="text"
                className="w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Source"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <option key={0} hidden>
                  Choisir source
                </option>
                {conditionRender?.values?.map((source, index) => (
                  <option key={index + 1} value={`${source}`}>{`${translateSource[source]}`}</option>
                ))}
              </select>
            ),
            contactDepartment: (
              <select
                type="text"
                className="w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Departement"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <option key={0} hidden>
                  Choisir Département
                </option>
                {conditionRender?.values?.map((contactDepartment, index) => (
                  <option key={index + 1} value={contactDepartment}>
                    {contactDepartment}
                  </option>
                ))}
              </select>
            ),
            contactRegion: (
              <select
                type="text"
                className="w-1/4 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Région"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              >
                <option key={0} hidden>
                  Choisir Région
                </option>
                {conditionRender?.values?.map((contactRegion, index) => (
                  <option key={index + 1} value={`${contactRegion}`}>{`${contactRegion}`}</option>
                ))}
              </select>
            ),
            contactEmail: (
              <input
                type="input"
                className="w-1/4 rounded border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                placeholder="Contenu du mail"
                value={value ?? ""}
                disabled={!operator}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            ),
          }[field]
        }

        <div className="ml-6 flex flex-none items-center gap-2">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50"
            onClick={onDelete}
          >
            <HiMinus />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50"
            onClick={onDuplicate}
          >
            <HiOutlineDuplicate />
          </button>
        </div>
      </div>
    </div>
  );
};

const Actions = ({ actionsRender, actionSelected, onChange, onDuplicate, onDelete }) => {
  const [field, setField] = useState(actionSelected.field);
  const [value, setValue] = useState(actionSelected.value);

  const actionRender = actionsRender.find((elem) => elem.field === field);

  const handleFieldChange = (field) => {
    setField(field);
    setValue("");
    onChange({ ...actionSelected, field, action: "SET", value });
  };

  const handleValueChange = (value) => {
    setValue(value);
    onChange({ ...actionSelected, field, value });
  };
  return (
    <div className="mb-3 flex items-center gap-4">
      <select
        type="text"
        className="w-2/3 flex-1 rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
        placeholder="Nom du dossier"
        value={field}
        onChange={(e) => {
          handleFieldChange(e.target.value);
        }}
      >
        <option key={0} hidden>
          Sélectionner une action
        </option>
        {actionsRender?.map((actionRender, index) => (
          <option key={index} value={actionRender.field}>
            {translateVentilationFieldAction[actionRender.field]}
          </option>
        ))}
      </select>

      {
        {
          status: (
            <select
              type="text"
              className="w-1/3 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Statut"
              value={value ?? ""}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              <option key={0} hidden>
                Choisir status
              </option>
              {actionRender?.values?.map((status, index) => (
                <option key={index} value={status}>
                  {translateState[status]}
                </option>
              ))}
            </select>
          ),
          agentId: (
            <select
              type="text"
              className="w-1/3 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Agent"
              value={value ?? ""}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              <option key={0} hidden>
                Choisir agent
              </option>
              {actionRender?.values?.map((agent, index) => (
                <option key={index} value={`${agent._id}`}>{`${agent.firstName} ${agent.lastName}`}</option>
              ))}
            </select>
          ),
          foldersId: (
            <select
              type="text"
              className="w-1/3 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Agent"
              value={value ?? ""}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              <option key={0} hidden>
                Choisir dossier
              </option>
              {actionRender?.values?.map((folder, index) => (
                <option key={index} value={`${folder._id}`}>{`${folder.name}`}</option>
              ))}
            </select>
          ),
          tag: (
            <select
              type="text"
              className="w-1/3 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Tag"
              value={value ?? ""}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              <option key={0} hidden>
                Choisir tag
              </option>
              {actionRender?.values?.map((tag, index) => (
                <option key={index} value={`${tag._id}`}>{`${tag.label}`}</option>
              ))}
            </select>
          ),
          copyRecipient: (
            <select
              type="text"
              className="w-1/3 flex-none rounded border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Destinataires en copie"
              value={value ?? ""}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              <option key={0} hidden>
                Choisir destinataires en copie
              </option>
              {actionRender?.values?.map((contact, index) => (
                <option key={index} value={`${contact}`}>{`${contact}`}</option>
              ))}
            </select>
          ),
        }[field]
      }
      <div className="ml-6 flex flex-none items-center gap-2">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50"
          onClick={onDelete}
        >
          <HiMinus />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50"
          onClick={onDuplicate}
        >
          <HiOutlineDuplicate />
        </button>
      </div>
    </div>
  );
};

function VentilationRule({ ventilationRule, deleteVentilation, updateVentilation, agents, tags, folders }) {
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  return (
    <>
      <div className="grid grid-cols-[100px_1fr_100px_100px_80px_40px] items-center last:rounded-b-lg odd:bg-white even:bg-gray-50">
        <p className="flex-1 px-6 py-4 text-sm text-gray-900">{ventilationRule.name}</p>
        <p className="flex-1 px-6 py-4 text-sm text-gray-500">{ventilationRule.description}</p>
        <p className="flex-1 px-6 py-4 text-sm text-gray-500">-</p>
        <p className="flex-1 px-6 py-4 text-sm text-gray-500">-</p>
        <div className="flex items-center">
          <button
            onClick={() => {
              updateVentilation({ _id: ventilationRule._id, active: ventilationRule.active ? false : true });
            }}
            className={`rounded-full py-1 text-center text-xs font-medium  text-green-900 ${ventilationRule.active === true ? "bg-green-300" : "bg-gray-100"}`}
          >
            {ventilationRule.active ? "Actif" : "Inactif"}
          </button>

          <button
            type="button"
            className="ml-2 flex items-center rounded-full bg-gray-100 text-xl transition-colors hover:bg-gray-900"
            onClick={() => {
              setOpen(true);
              setIsUpdate(true);
            }}
          >
            <HiOutlineDotsHorizontal />
          </button>
          <button type="button" className=" ml-2 flex items-center text-xl text-red-400 transition-colors hover:text-red-600" onClick={() => deleteVentilation(ventilationRule)}>
            <HiX />
          </button>
        </div>
      </div>
      <ModalContent open={open} setOpen={setOpen} ventilation={ventilationRule} isUpdate={isUpdate} setIsUpdate={setIsUpdate} agents={agents} tags={tags} folders={folders} />
    </>
  );
}
