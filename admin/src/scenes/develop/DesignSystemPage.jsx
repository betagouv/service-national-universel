import React from "react";
import { Page, Header, Subheader, Container, InputText, Button, Select } from "@snu/ds/admin";
import { HiOutlineCommandLine } from "react-icons/hi2";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { HiOutlinePencil } from "react-icons/hi";

const generateInitialValues = (length) => {
  let obj = {};
  for (let i = 1; i <= length; i++) {
    obj[`input${i}`] = "";
  }
  return obj;
};

export default function DesignSystemPage() {
  const [values, setValues] = React.useState(generateInitialValues(10));
  const error = "Ceci est une erreur";

  const handleChange = (event) => {
    event.persist();
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };
  const selectTest = [
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

  return (
    <Page>
      <Header
        title="Design System"
        breadcrumb={[
          { href: "/", title: <HiOutlineCommandLine size={20} /> },
          { href: "/design-system", title: "Design System" },
        ]}
        actions={[<ButtonPrimary key="header-action-1">Click me</ButtonPrimary>]}
      />
      <Subheader title="Code, preview, test, build and ship." />
      <Container title="Champs simples (InputText)">
        <div className="grid grid-cols-2 gap-4 w-full">
          <InputText placeholder="Input text normal" disabled={false} active={false} name="input1" value={values.input1} onChange={handleChange} readOnly={false} />
          <InputText placeholder="Input text disabled" disabled={true} active={true} name="input2" value={values.input2} onChange={handleChange} readOnly={false} />
          <InputText placeholder="Input text actif" disabled={false} active={true} name="input3" value={values.input3} onChange={handleChange} readOnly={false} />
          <InputText placeholder="Input text readOnly" disabled={false} active={false} name="input4" value={values.input4} onChange={handleChange} readOnly={true} />
          <InputText placeholder="Input text error" disabled={false} active={false} name="input5" value={values.input5} onChange={handleChange} readOnly={false} error={error} />
        </div>
      </Container>
      <Container title="Champs avec label (InputTextLabel)">
        <div className="grid grid-cols-2 gap-4 w-full">
          <InputText
            placeholder="Input text normal"
            disabled={false}
            active={false}
            name="input6"
            value={values.input6}
            onChange={handleChange}
            readOnly={false}
            label="InputTextLabel"
          />
          <InputText
            placeholder="Input text disabled"
            disabled={true}
            active={true}
            name="input7"
            value={values.input7}
            onChange={handleChange}
            readOnly={false}
            label="InputTextLabel"
          />
          <InputText
            placeholder="Input text actif"
            disabled={false}
            active={true}
            name="input8"
            value={values.input8}
            onChange={handleChange}
            readOnly={false}
            label="InputTextLabel"
          />
          <InputText
            placeholder="Input text readOnly"
            disabled={false}
            active={false}
            name="input9"
            value={values.input9}
            onChange={handleChange}
            readOnly={true}
            label="InputTextLabel"
          />
          <InputText
            placeholder="Input text error"
            disabled={false}
            active={false}
            name="input10"
            value={values.input10}
            onChange={handleChange}
            readOnly={false}
            error={error}
            label="InputTextLabel"
          />
        </div>
      </Container>
      <div className="grid grid-rows-2 grid-flow-col gap-4">
        <Container className="row-span-2" title="Contacts administrateurs CLE" />
        <Container className="mb-0" title="Contacts référents de classe (6)" />
        <Container title="Autres contacts (2)" />
      </div>
      <Container title="Boutons">
        <div className="flex flex-col gap-3">
          <Button title={"Primary base"} />
          <Button title={"Primary base change"} className={"bg-red-500"} />
          <Button title={"Primary base disabled"} disabled={true} />
          <Button title={"Primary base + Icon"} leftIcon={<HiOutlineCommandLine size={20} />} />
          <Select title={"Primary base select"} optionsGroup={selectTest} />
          <Select title={"Primary base select disabled"} optionsGroup={selectTest} disabled={true} />
          <Button title={"Secondary base"} type={"secondary"} />
          <Button title={"Secondary disabled"} type={"secondary"} disabled={true} />
          <Button title={"Secondary base + Icon"} type={"secondary"} leftIcon={<HiOutlineCommandLine size={20} />} />
          <Select title={"Secondary base select"} optionsGroup={selectTest2} type={"secondary"} />
          <Select title={"Secondary base select disabled"} optionsGroup={selectTest2} type={"secondary"} disabled={true} />
          <Button title={"Tertiary base"} type={"tertiary"} />
          <Button title={"Tertiary base disabled"} type={"tertiary"} disabled={true} />
          <Button title={"Wired base"} type={"wired"} />
          <Button title={"Wired base disabled"} type={"wired"} disabled={true} />
          <Button title={"Wired base + Icon"} type={"wired"} leftIcon={<HiOutlineCommandLine size={20} />} />
          <Button title={"Modifier"} type={"change"} leftIcon={<HiOutlinePencil size={16} />} />
          <Button title={"Modifier disabled"} type={"change"} disabled={true} />
          <Button title={"Annuler"} type={"cancel"} />
          <Button title={"Annuler disabled"} type={"cancel"} disabled={true} />
        </div>
      </Container>
    </Page>
  );
}
