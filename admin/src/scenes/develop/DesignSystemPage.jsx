import React from "react";
import { Page, Header, Subheader, Container, InputText } from "@snu/ds/admin";
import { HiOutlineCommandLine } from "react-icons/hi2";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

export default function DesignSystemPage() {
  const [values, setValues] = React.useState({
    input1: "",
    input2: "",
    input3: "",
    input4: "",
    input5: "",
  });
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
      <Container title="Hello...">
        <div className="text-ds-red">...World!</div>
      </Container>
      <Container title="Champs simples (InputText)">
        <div className="grid grid-cols-2 gap-4 w-full">
          <InputText placeholder="Input text normal" disabled={false} active={false} name="input1" value={values.input1} onChange={handleChange} readOnly={false} />
          <InputText placeholder="Input text disabled" disabled={true} active={true} name="input2" value={values.input2} onChange={handleChange} readOnly={false} />
          <InputText placeholder="Input text actif" disabled={false} active={true} name="input3" value={values.input3} onChange={handleChange} readOnly={false} />
          <InputText placeholder="Input text readOnly" disabled={false} active={false} name="input4" value={values.input4} onChange={handleChange} readOnly={true} />
          <InputText placeholder="Input text error" disabled={false} active={false} name="input5" value={values.input5} onChange={handleChange} readOnly={false} error={error} />
        </div>
      </Container>
    </Page>
  );
}
