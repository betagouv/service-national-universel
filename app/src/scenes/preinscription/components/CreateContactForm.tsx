import React, { useState } from "react";
import ErrorComponent from "@/components/error";
import DatePicker from "@/components/dsfr/forms/DatePicker";
import validator from "validator";
import { Button, Highlight, Input } from "@snu/ds/dsfr";
import { calculateAge } from "snu-lib";
import { capture } from "@/sentry";
import { createLead } from "../preinscription.repository";

export default function CreateContactForm({ data, onSuccess }) {
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState(data.birthDate);
  const [emailError, setEmailError] = useState("");
  const [birthdateError, setBirthdateError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setEmailError("");
    setBirthdateError("");

    let isError = false;

    if (!email) {
      isError = true;
      setEmailError("Ce champ est obligatoire");
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      isError = true;
      setEmailError("L'e-mail renseigné est invalide");
    }

    if (!birthdate) {
      isError = true;
      setBirthdateError("Ce champ est obligatoire");
    }

    if (birthdate && calculateAge(birthdate, new Date()) > 18) {
      isError = true;
      setBirthdateError("Vous devez être âgé de moins de 18 ans");
    }

    if (isError) return;

    setLoading(true);
    try {
      const { id } = await createLead({
        email: trimmedEmail,
        birthdate,
        region: data.school?.region || data.region,
        isAbroad: data.isAbroad,
      });

      if (!id) {
        throw new Error("An error occured while creating the lead");
      }

      onSuccess();
    } catch (e) {
      capture(e);
      setFetchError(true);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} id="create-contact-form">
      <Highlight>📬 Soyez informé(e) de l’ouverture des inscriptions pour les prochaines sessions SNU en renseignant votre adresse e-mail et votre date de naissance.</Highlight>

      {fetchError && (
        <div className="mt-12">
          <ErrorComponent text="Une erreur est survenue" subText="Veuillez réessayer plus tard." onClose={() => setFetchError(false)} />
        </div>
      )}

      <Input
        id="email"
        nativeInputProps={{
          name: "email",
          id: "email",
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
        }}
        label="Votre e-mail"
        state={emailError ? "error" : "default"}
        stateRelatedMessage={emailError}
        className="!mt-12"
      />

      <label className="w-full mt-4">
        Votre date de naissance
        <DatePicker
          setError={(isError: boolean) => setBirthdateError(isError ? "Date invalide" : "")}
          initialValue={new Date(data.birthDate)}
          onChange={(date: Date) => setBirthdate(date)}
          state={birthdateError ? "error" : "default"}
          errorText={birthdateError}
        />
      </label>

      <div className="flex">
        <Button
          nativeButtonProps={{
            type: "submit",
            form: "create-contact-form",
            disabled: loading,
          }}
          className="mt-4 !w-full items-center justify-center md:!w-auto !px-10 ml-auto">
          Envoyer
        </Button>
      </div>
    </form>
  );
}
