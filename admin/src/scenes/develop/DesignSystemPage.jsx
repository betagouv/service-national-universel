import React from "react";
import { Page, Header, Subheader, Container, InputText, Badge } from "@snu/ds/admin";
import { HiOutlineCommandLine } from "react-icons/hi2";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { HiUsers, HiPencil, HiChevronDown } from "react-icons/hi";
import { TbExternalLink } from "react-icons/tb";

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
          />
          <Badge title={<HiPencil size={20} />} status={"primary"} mode={"editable"} onClick={() => console.log("test")} className={"rounded-[50%] !p-0 !w-8"} />
          <Badge
            title={"Candidature approuvée"}
            status={"validated"}
            mode={"editable"}
            rightIcon={<HiChevronDown size={20} />}
            className={"hover:bg-green-200"}
            onClick={() => console.log("test")}
          />
          <Badge title={"Désistée"} status={"cancel"} />
          <Badge title={"Refusée"} status={"refused"} />
          <Badge title={"En attente de validation"} status={"waitingValidation"} />
          <Badge title={"En attente de correction"} status={"waitingCorrection"} />
          <Badge title={"En cours"} status={"inProgress"} />
          <Badge title={"Validée sur liste principale"} status={"validated"} />
          <Badge title={"Validée sur liste complémentaire"} status={"validatedBis"} className="!w-[100px]" />
          <Badge title={"Brouillon"} status={"draft"} />
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
