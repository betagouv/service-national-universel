import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { Badge, Container, Header, InputText, Page, Subheader } from "@snu/ds/admin";
import React from "react";
import { HiChevronDown, HiPencil, HiUsers } from "react-icons/hi";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { TbExternalLink } from "react-icons/tb";

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
        actions={[<ButtonPrimary key="header-action-1">Click me</ButtonPrimary>]}
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
