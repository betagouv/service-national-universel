import React, { useEffect, useState } from "react";
import { Page, Header, Subheader, Container, InputText, Badge, Button, DropdownButton } from "@snu/ds/admin";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { HiUsers, HiPencil, HiOutlinePencil } from "react-icons/hi";
import { TbExternalLink } from "react-icons/tb";
import { BsCheck } from "react-icons/bs";
import { InputPhone } from "@snu/ds/admin";
import { PHONE_ZONES } from "snu-lib";

export default function DesignSystemPage() {
  const [values, setValues] = React.useState({
    input1: "",
    input1Phone: "",
    input1PhoneZone: "",
  });

  const error = "Ceci est une erreur";

  const handleChange = (event, nameExtention) => {
    event.persist();
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const [StatusTitle, setStatusTitle] = useState("Candidature approuvée");
  const [StatusSelect, setStatusSelect] = useState("validated");
  const [SelectClassName, setSelectClassName] = useState("hover:bg-green-200");

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
            setStatusSelect("validated");
            setSelectClassName("hover:bg-green-200");
          },
          render: (
            <div className="flex items-center gap-4 p-2 px-3">
              <div className="w-3 h-3 bg-green-500 rounded-[50%] mt-0.5" />
              <div className={`${StatusSelect === "validated" && "font-bold"} text-sm`}>Candidature Approuvée</div>
              {StatusSelect === "validated" && <BsCheck size={20} color="black" className="mt-0.5" />}
            </div>
          ),
        },
        {
          key: "2",
          action: () => {
            setStatusTitle("Candidature non Retenue");
            setStatusSelect("refused");
            setSelectClassName("hover:bg-red-200");
          },
          render: (
            <div className="flex items-center gap-4 p-2 px-3">
              <div className="w-3 h-3 bg-red-500 rounded-[50%] mt-0.5" />
              <div className={`${StatusSelect === "refused" && "font-bold"} text-sm`}>Candidature non Retenue</div>
              {StatusSelect === "refused" && <BsCheck size={20} color="black" className="mt-0.5" />}
            </div>
          ),
        },
      ],
    },
  ];

  const handleChangeValue = (value, name) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Page>
      <Header
        title="Design System"
        breadcrumb={[
          { href: "/", title: <HiOutlineCommandLine size={20} /> },
          { href: "/design-system", title: "Design System" },
        ]}
        actions={[<Button key="header-action-1" title={"Click me"} />]}
      />
      <Subheader title="Code, preview, test, build and ship." />
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
          <Badge title={"Drome"} mode={"editable"} rightIcon={<TbExternalLink size={20} />} className={"hover:bg-gray-200"} />
          <Badge title={"Avril 2023 - A"} leftIcon={<HiUsers color="#6366F1" size={20} />} />
          <Badge
            title={"Avril 2023 - A"}
            status={"primary"}
            mode={"editable"}
            leftIcon={<HiUsers size={20} />}
            rightIcon={<HiPencil size={20} />}
            onClick={() => console.log("test")}
            optionsGroup={selectTest2}
          />
          <Badge title={<HiPencil size={20} />} status={"primary"} mode={"editable"} onClick={() => console.log("test")} className={"rounded-[50%] !p-0 !w-8"} />
          <DropdownButton title={StatusTitle} status={StatusSelect} buttonClassNames={SelectClassName} mode={"badge"} optionsGroup={selectTestStatus} />
          <Badge title={"Désistée"} status={"cancel"} />
          <Badge title={"Refusée"} status={"refused"} />
          <Badge title={"En attente de validation"} status={"waitingValidation"} />
          <Badge title={"En attente de correction"} status={"waitingCorrection"} />
          <Badge title={"En cours"} status={"inProgress"} />
          <Badge title={"Validée sur liste principale"} status={"validated"} />
          <Badge title={"Validée sur liste complémentaire"} status={"validatedBis"} className="!w-[100px]" />
          <Badge title={"Validée sur liste complémentaire"} status={"validatedBis"} />
          <Badge title={"Brouillon"} status={"draft"} />
        </div>
      </Container>
      <Container title="Boutons">
        <div className="grid grid-cols-3 gap-3">
          <Button title={"Primary base"} />
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
      <div className="grid grid-rows-2 grid-flow-col gap-4">
        <Container className="row-span-2" title="Contacts administrateurs CLE" />
        <Container className="mb-0" title="Contacts référents de classe (6)" />
        <Container title="Autres contacts (2)" />
      </div>
    </Page>
  );
}
