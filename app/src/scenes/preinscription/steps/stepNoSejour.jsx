import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { useHistory } from "react-router-dom";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import { Button, Input, SignupButtons } from "@snu/ds/dsfr";
import EngagementPrograms from "../components/EngagementPrograms";
import Highlight from "@codegouvfr/react-dsfr/Highlight";
import Error from "@/components/error";
import DatePicker from "@/components/dsfr/forms/DatePicker";
import validator from "validator";
import { calculateAge } from "snu-lib";
import { capture } from "@/sentry";
import { createLead } from "../preinscription.repository";

export default function NonEligible() {
  const history = useHistory();
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const context = isLoggedIn ? ReinscriptionContext : PreInscriptionContext;
  const [data, removePersistedData] = useContext(context);
  const [success, setSuccess] = useState(false);

  const onClickButton = () => {
    removePersistedData();
    history.push("/");
  };

  return (
    <>
      <DSFRContainer title="Nous n'avons pas trouvé de séjour qui correspond à votre situation.">
        {success ? <p>Merci ! Nous vous tiendrons informé(e) de l'ouverture des inscriptions.</p> : <Form data={data} onSuccess={() => setSuccess(true)} />}

        <hr className="my-8" />

        <EngagementPrograms />
        <SignupButtons onClickNext={onClickButton} labelNext="Revenir à l'accueil" />
      </DSFRContainer>
    </>
  );
}

function Form({ data, onSuccess }) {
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState(data.birthDate);
  const [validationErrors, setValidationErrors] = useState({ email: "", birthdate: "" });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    let errors = {};

    if (!email) {
      errors.email = "Ce champ est obligatoire";
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      errors.email = "L'e-mail renseigné est invalide";
    }

    if (!birthdate) {
      errors.birthdate = "Ce champ est obligatoire";
    }

    if (birthdate && calculateAge(birthdate, new Date()) > 18) {
      errors.birthdate = "Vous devez être âgé de moins de 18 ans";
    }

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setFetchError(false);

    setLoading(true);
    try {
      await createLead({
        email: trimmedEmail,
        birthdate,
        region: data.school?.region || data.region,
        isAbroad: data.isAbroad,
      });

      onSuccess();
    } catch (e) {
      capture(e);
      setFetchError(true);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Highlight className="mt-2">
        📬 Soyez informé(e) de l’ouverture des inscriptions pour les prochaines sessions SNU en renseignant votre adresse e-mail et votre date de naissance.
      </Highlight>

      {fetchError && (
        <div className="mt-12">
          <Error text="Une erreur est survenue" subText="Veuillez réessayer plus tard." onClose={() => setFetchError(false)} />
        </div>
      )}

      <Input
        name="email"
        id="email"
        type="email"
        label="Votre e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        state={validationErrors.email ? "error" : "default"}
        stateRelatedMessage={validationErrors.email}
        className="!mt-12"
      />

      <label className="w-full mt-4">
        Votre date de naissance
        <DatePicker
          value={birthdate}
          initialValue={new Date(data.birthDate)}
          onChange={(date) => setBirthdate(date)}
          state={validationErrors.birthdate ? "error" : "default"}
          errorText={validationErrors.birthdate}
        />
      </label>

      <div className="flex">
        <Button type="submit" disabled={loading} className="mt-4 !w-full items-center justify-center md:!w-auto !px-10 ml-auto">
          Envoyer
        </Button>
      </div>
    </form>
  );
}
