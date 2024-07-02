import React, { useState } from "react";
import { Page, Header, Subheader, Container, InputText, Badge, Button, DropdownButton, Select, Navbar } from "@snu/ds/admin";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { HiUsers, HiPencil, HiOutlinePencil, HiOutlineHome } from "react-icons/hi";
import { TbExternalLink } from "react-icons/tb";
import { BsCheck } from "react-icons/bs";

import { InputPhone } from "@snu/ds/admin";
import { PHONE_ZONES } from "snu-lib";

import api from "@/services/api";
import ModalExamples from "./components/Modal";
import ProfilePicExamples from "./components/ProfilePic";
import Colors from "./components/Colors";

export default function DesignSystemPage() {
  const [values, setValues] = React.useState({
    input1: "",
    input1Phone: "",
    input1PhoneZone: "",
  });
  const [valueSelect, setValuesSelect] = useState({
    monoSelect: "",
    multiSelect: [],
    monoAsyncSelect: "",
    multiAsyncSelect: [],
  });
  const SelectOptions = [
    { value: "1", label: "Item 1" },
    { value: "2", label: "Item 2" },
    { value: "3", label: "Item 3" },
    { value: "4", label: "Item 4" },
    { value: "5", label: "Item 5" },
  ];

  const fetchStructures = async (inputValue) => {
    const { responses } = await api.post("/elasticsearch/structure/search", { filters: { searchbar: [inputValue] } });
    return responses[0].hits.hits.map((hit) => {
      return { value: hit._source, _id: hit._id, label: hit._source.name, structure: hit._source };
    });
  };

  const error = "Ceci est une erreur";

  const handleChange = (event, nameExtention) => {
    event.persist();
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };
  const handleMonoSelectChange = (selectedOption) => {
    if (selectedOption) {
      setValuesSelect({
        ...valueSelect,
        monoSelect: selectedOption.value,
      });
    } else {
      setValuesSelect({
        ...valueSelect,
        monoSelect: "",
      });
    }
  };
  const handleMonoAsyncSelectChange = (selectedOption) => {
    if (selectedOption) {
      setValuesSelect({
        ...valueSelect,
        monoAsyncSelect: selectedOption.value,
      });
    } else {
      setValuesSelect({
        ...valueSelect,
        monoAsyncSelect: "",
      });
    }
  };
  const handleMultiSelectChange = (selectedOption) => {
    setValuesSelect({ ...valueSelect, multiSelect: selectedOption.map((opt) => opt.value) });
  };
  const handleMultiAsyncSelectChange = (selectedOption) => {
    setValuesSelect({ ...valueSelect, multiAsyncSelect: selectedOption.map((opt) => opt.value) });
  };

  console.log(valueSelect);

  const [StatusTitle, setStatusTitle] = useState("Candidature approuvée");
  const [StatusSelect, setStatusSelect] = useState("VALIDATED");

  const selectTest = [
    {
      key: "1",
      title: "Option 1",
      items: [
        {
          key: "1",
          render: (
            <>
              <HiOutlineCommandLine size={20} color="red" />
              <p className="text-red-500">Supprimer</p>
            </>
          ),
          optionClassNames: "hover:bg-red-200",
        },
        {
          key: "2",
          render: (
            <>
              <HiOutlineCommandLine size={20} />
              <p>Select Options 2</p>
            </>
          ),
        },
      ],
    },
    {
      key: "2",
      title: "Option 2",
      items: [
        { key: "3", render: <p>Select Options 3</p> },
        { key: "4", render: <p>Select Options 4</p> },
      ],
    },
  ];
  const selectTest2 = [
    {
      key: "1",
      title: "Option 1",
      items: [
        { key: "1", render: <p className="text-red-500">Select Options 1</p> },
        {
          key: "2",
          render: (
            <>
              <HiOutlineCommandLine size={20} />
              <p>Select Options 2</p>
            </>
          ),
        },
      ],
    },
  ];
  const selectTestStatus = [
    {
      key: "1",
      title: "Status",
      items: [
        {
          key: "1",
          action: () => {
            setStatusTitle("Candidature approuvée");
            setStatusSelect("VALIDATED");
          },
          render: (
            <div className="flex items-center gap-4 p-2 px-3">
              <div className="w-3 h-3 shrink-0 bg-emerald-600 rounded-[50%] mt-0.5" />
              <div className={`${StatusSelect === "WAITING_LIST" && "font-bold"} text-sm`}>Candidature Approuvée</div>
              {StatusSelect === "WAITING_LIST" && <BsCheck size={20} color="black" className="mt-0.5" />}
            </div>
          ),
        },
        {
          key: "2",
          action: () => {
            setStatusTitle("Candidature non Retenue");
            setStatusSelect("REFUSED");
          },
          render: (
            <div className="flex items-center gap-4 p-2 px-3">
              <div className="w-3 h-3 shrink-0 bg-red-500 rounded-[50%] mt-0.5" />
              <div className={`${StatusSelect === "REFUSED" && "font-bold"} text-sm`}>Candidature non Retenue</div>
              {StatusSelect === "REFUSED" && <BsCheck size={20} color="black" className="mt-0.5" />}
            </div>
          ),
        },
      ],
    },
  ];

  const handleChangeValue = (value, name) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const [isActive, setIsActive] = useState({
    tab1: true,
    tab2: false,
    tab3: false,
    tab4: false,
  });

  return (
    <Page>
      <Header
        title="Design System"
        breadcrumb={[{ to: "/", title: <HiOutlineHome size={20} /> }, { title: "Design System" }]}
        actions={[<Button key="header-action-1" title={"Click me"} />]}
      />
      <Subheader title="Code, preview, test, build and ship." />
      <Navbar
        tab={[
          {
            title: "Aller",
            leftIcon: <HiOutlineCommandLine size={20} className="mt-0.5" />,
            isActive: isActive.tab1,
            onClick: () => setIsActive({ tab1: true, tab2: false, tab3: false, tab4: false }),
          },
          {
            title: "Retour",
            isActive: isActive.tab2,
            leftIcon: <HiOutlineCommandLine size={20} className="mt-0.5" />,
            onClick: () => setIsActive({ tab1: false, tab2: true, tab3: false, tab4: false }),
          },
          {
            title: "Historique",
            leftIcon: <HiOutlineCommandLine size={20} className="mt-0.5" />,
            isActive: isActive.tab3,
            onClick: () => setIsActive({ tab1: false, tab2: false, tab3: true, tab4: false }),
          },
          {
            title: "Demande de modifications",
            leftIcon: <HiOutlineCommandLine size={20} className="mt-0.5" />,
            isActive: isActive.tab4,
            onClick: () => setIsActive({ tab1: false, tab2: false, tab3: false, tab4: true }),
          },
        ]}
        button={[<Button key={"button-1"} title={"Primary base"} />, <Button key={"button-2"} title={"Primary base"} loading />]}
      />
      <Container title="Champs simples (InputText)">
        <div className="grid grid-cols-3 gap-4 w-full">
          <InputText placeholder="Input text normal" name="input1" value={values.input1} onChange={handleChange} />
          <InputText placeholder="Input text disabled" disabled={true} name="input1" value={values.input1} onChange={handleChange} />
          <InputText placeholder="Input text actif" active={true} name="input1" value={values.input1} onChange={handleChange} />
          <InputText placeholder="Input text readOnly" name="input1" value={values.input1} onChange={handleChange} readOnly={true} />
          <InputText placeholder="Input text error" name="input1" value={values.input1} onChange={handleChange} error={error} />
        </div>
      </Container>
      <Container title="Champs avec label (InputText)">
        <div className="grid grid-cols-3 gap-4 w-full">
          <InputText placeholder="Input text normal" name="input1" value={values.input1} onChange={handleChange} label="InputTextLabel" />
          <InputText placeholder="Input text disabled" disabled={true} name="input1" value={values.input1} onChange={handleChange} label="InputTextLabel" />
          <InputText placeholder="Input text actif" active={true} name="input1" value={values.input1} onChange={handleChange} label="InputTextLabel" />
          <InputText placeholder="Input text readOnly" name="input1" value={values.input1} onChange={handleChange} readOnly={true} label="InputTextLabel" />
          <InputText placeholder="Input text error" name="input1" value={values.input1} onChange={handleChange} error={error} label="InputTextLabel" />
        </div>
      </Container>
      <Container title="InputPhone">
        <div className="grid grid-cols-3 gap-4 w-full">
          <InputPhone
            name="input11"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
          />
          <InputPhone
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            disabled={true}
          />
          <InputPhone
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            active={true}
          />
          <InputPhone
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            readOnly={true}
          />
          <InputPhone
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            error={error}
          />
        </div>
      </Container>
      <Container title="InputPhone avec label">
        <div className="grid grid-cols-3 gap-4 w-full">
          <InputPhone
            label="InputPhoneLabel normal"
            name="input11"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
          />
          <InputPhone
            label="InputPhoneLabel disabled"
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            disabled={true}
          />
          <InputPhone
            label="InputPhoneLabel actif"
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            active={true}
          />
          <InputPhone
            label="InputPhoneLabel readOnly"
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            readOnly={true}
          />
          <InputPhone
            label="InputPhoneLabel error"
            name="input1"
            onChange={(v) => handleChangeValue(v, "input1Phone")}
            onChangeZone={(v) => handleChangeValue(v, "input1PhoneZone")}
            value={values.input1Phone}
            zoneValue={values.input1PhoneZone}
            placeholder={PHONE_ZONES[values.input1PhoneZone]?.example}
            error={error}
          />
        </div>
      </Container>
      <Container title="Badges">
        <div className="grid grid-cols-4 gap-2 px-1">
          <Badge title={"Phase 1"} />
          <Badge title={"Référent départemental"} />
          <Badge title={"Préparation militaire"} status={"secondary"} />
          <Badge title={"Drome"} mode={"editable"} rightIcon={<TbExternalLink size={16} />} className={"hover:bg-gray-200"} />
          <Badge title={"Avril 2023 - A"} leftIcon={<HiUsers color="#6366F1" size={16} />} />
          <Badge
            title={"Avril 2023 - A"}
            status={"primary"}
            mode={"editable"}
            leftIcon={<HiUsers size={16} />}
            rightIcon={<HiPencil size={16} />}
            onClick={() => console.log("test")}
            optionsGroup={selectTest2}
          />
          <Badge title={<HiPencil size={16} />} status={"primary"} mode={"editable"} onClick={() => console.log("test")} className={"rounded-[50%] !p-0 !w-8"} />
          <DropdownButton title={StatusTitle} status={StatusSelect} mode={"badge"} optionsGroup={selectTestStatus} />
          <Badge title={"Désisté"} status={"CANCEL"} />
          <Badge title={"Refusée"} status={"REFUSED"} />
          <Badge title={"En attente de validation"} status={"WAITING_VALIDATION"} />
          <Badge title={"En attente de correction"} status={"WAITING-CORRECTION"} />
          <Badge title={"En cours"} status={"IN_PROGRESS"} />
          <Badge title={"Validée sur liste principale"} status={"VALIDATED"} />
          <Badge title={"Validée sur liste complémentaire"} status={"WAITING_LIST"} className="!w-[100px]" />
          <Badge title={"Validée sur liste complémentaire"} status={"WAITING_LIST"} />
          <Badge title={"Brouillon"} status={"DRAFT"} />
        </div>
      </Container>
      <Container title="Boutons">
        <div className="grid grid-cols-3 gap-3">
          <Button title={"Primary base"} />
          <Button title={"Primary base"} loading />
          <Button title={"Primary base change"} className={"bg-red-500 !w-[100px] hover:bg-red-700"} />
          <Button title={"Primary base disabled"} disabled={true} />
          <Button title={"Primary base + Icon"} leftIcon={<HiOutlineCommandLine size={20} />} />
          <DropdownButton title={"Primary base select"} optionsGroup={selectTest} />
          <DropdownButton title={"Primary base select disabled"} optionsGroup={selectTest} disabled={true} />
          <Button title={"Secondary base"} type={"secondary"} />
          <Button title={"Secondary disabled"} type={"secondary"} disabled={true} />
          <Button title={"Secondary base + Icon"} type={"secondary"} leftIcon={<HiOutlineCommandLine size={20} />} />
          <DropdownButton title={"Secondary base select"} optionsGroup={selectTest2} type={"secondary"} />
          <DropdownButton title={"Secondary base select disabled"} optionsGroup={selectTest2} type={"secondary"} disabled={true} />
          <Button title={"Tertiary base"} type={"tertiary"} />
          <Button title={"Tertiary base disabled"} type={"tertiary"} disabled={true} />
          <Button title={"Wired base"} type={"wired"} />
          <Button title={"Wired base disabled"} type={"wired"} disabled={true} />
          <Button title={"Wired base + Icon"} type={"wired"} leftIcon={<HiOutlineCommandLine size={20} />} />
          <Button title={"Modifier"} type={"change"} leftIcon={<HiOutlinePencil size={16} />} />
          <Button title={"Modifier disabled"} type={"change"} disabled={true} leftIcon={<HiOutlinePencil size={16} />} />
          <Button title={"Annuler"} type={"cancel"} />
          <Button title={"Annuler disabled"} type={"cancel"} disabled={true} />
        </div>
      </Container>
      <Container title="Select">
        <div className="grid grid-cols-3 gap-4 w-full">
          <Select
            placeholder="Mono Select"
            defaultValue={SelectOptions[0]}
            options={SelectOptions}
            value={SelectOptions.find((option) => option.value === valueSelect.monoSelect)}
            onChange={handleMonoSelectChange}
          />
          <Select
            placeholder="Mono Select"
            defaultValue={SelectOptions[0]}
            options={SelectOptions}
            isActive={true}
            value={SelectOptions.find((option) => option.value === valueSelect.monoSelect)}
            onChange={handleMonoSelectChange}
          />
          <Select
            placeholder="Mono Select"
            defaultValue={SelectOptions[0]}
            options={SelectOptions}
            readOnly={true}
            value={SelectOptions.find((option) => option.value === valueSelect.monoSelect)}
            onChange={handleMonoSelectChange}
          />
          <Select
            placeholder="Mono Select with Label"
            options={SelectOptions}
            value={SelectOptions.find((option) => option.value === valueSelect.monoSelect)}
            label="selectTest"
            isClearable={true}
            onChange={handleMonoSelectChange}
          />
          <Select
            placeholder="Mono Select disabled"
            options={SelectOptions}
            value={SelectOptions.find((option) => option.value === valueSelect.monoSelect)}
            onChange={handleMonoSelectChange}
            disabled={true}
          />
          <Select
            placeholder="Mono Select with Label"
            options={SelectOptions}
            value={SelectOptions.find((option) => option.value === valueSelect.monoSelect)}
            label="selectTest2"
            onChange={handleMonoSelectChange}
            error={error}
          />
          <Select
            placeholder="Mono Select"
            options={SelectOptions}
            value={SelectOptions.find((option) => option.value === valueSelect.monoSelect)}
            onChange={handleMonoSelectChange}
            error={error}
          />
          <Select
            placeholder="Multi Select"
            options={SelectOptions}
            isMulti={true}
            isClearable={true}
            value={valueSelect.multiSelect?.map((value) => {
              const label = SelectOptions.find((item) => item.value === value)?.label;
              return label ? { value: value, label } : null;
            })}
            onChange={handleMultiSelectChange}
          />
          <Select
            placeholder="Multi Select with label"
            options={SelectOptions}
            isMulti={true}
            isClearable={true}
            label="selectTest"
            value={valueSelect.multiSelect?.map((value) => {
              const label = SelectOptions.find((item) => item.value === value)?.label;
              return label ? { value: value, label } : null;
            })}
            onChange={handleMultiSelectChange}
          />
          <Select
            placeholder="Multi Select with label"
            options={SelectOptions}
            isMulti={true}
            isClearable={true}
            disabled={true}
            value={valueSelect.multiSelect?.map((value) => {
              const label = SelectOptions.find((item) => item.value === value)?.label;
              return label ? { value: value, label } : null;
            })}
            onChange={handleMultiSelectChange}
          />
          <Select
            placeholder="Multi Select with label"
            options={SelectOptions}
            isMulti={true}
            isClearable={true}
            label="selectTest"
            value={valueSelect.multiSelect?.map((value) => {
              const label = SelectOptions.find((item) => item.value === value)?.label;
              return label ? { value: value, label } : null;
            })}
            error={error}
            onChange={handleMultiSelectChange}
          />
          <Select
            isAsync
            placeholder="Mono Async Select"
            loadOptions={fetchStructures}
            isClearable={true}
            noOptionsMessage={"Aucune structure ne correspond à cette recherche"}
            value={valueSelect.monoAsyncSelect ? { label: valueSelect.monoAsyncSelect.name } : null}
            onChange={handleMonoAsyncSelectChange}
          />
          <Select
            isAsync
            placeholder="Multi Async Select"
            loadOptions={fetchStructures}
            isClearable={true}
            isMulti={true}
            noOptionsMessage={"Aucune structure ne correspond à cette recherche"}
            value={valueSelect.multiAsyncSelect?.map((item) => {
              return item ? { value: item, label: item.name } : null;
            })}
            onChange={handleMultiAsyncSelectChange}
          />
        </div>
      </Container>
      <ModalExamples />
      <ProfilePicExamples />
      <Colors />
      <div className="grid grid-rows-2 grid-flow-col gap-4">
        <Container className="row-span-2" title="Contacts administrateurs CLE" />
        <Container className="mb-0" title="Contacts référents de classe (6)" />
        <Container title="Autres contacts (2)" />
      </div>
    </Page>
  );
}
