import { Field, Formik } from "formik";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, Redirect } from "react-router-dom";
import validator from "validator";

import LoadingButton from "../../components/buttons/LoadingButton";
import MultiSelect from "../../components/Multiselect";
import PasswordEye from "../../components/PasswordEye";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import Header from "./components/header";

import { requiredMessage } from "../../components/errorMessage";
import { adminURL } from "../../config";
import { capture } from "../../sentry";
import { getDepartmentByZip, getRegionByZip, translate } from "snu-lib";
import { typesStructure, sousTypesStructure, legalStatus } from "../../utils";
import ModalInfo from "../../components/modals/ModalInfo";
import { isPossiblePhoneNumber } from "libphonenumber-js";

export default function Signup() {
  const dispatch = useDispatch();
  const [newUser, setNewUser] = React.useState(null);

  const user = useSelector((state) => state.Auth.user);
  if (user) return <Redirect to="/" />;

  const getStructure = (structureData) => {
    const region = getRegionByZip(structureData.zip);
    const department = getDepartmentByZip(structureData.zip);
    return { ...structureData, region, department };
  };

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <ModalInfo isOpen={newUser} message="Utilisateur et structure créés avec succès." onClose={() => dispatch(setUser(newUser))} closeText="Continuer">
        <p>Cette procédure vous a-t-elle donné satisfaction ?</p>
        <a
          href="https://jedonnemonavis.numerique.gouv.fr/Demarches/3507?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
          target="_blank"
          rel="noreferrer"
          className="">
          <img className="w-32" src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" />
        </a>
      </ModalInfo>
      <Header />
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{ user: {}, structure: {} }}
        onSubmit={async (values, actions) => {
          try {
            const { firstName, lastName, email, password, acceptCGU, phone } = values?.user || {};
            const { name, description, legalStatus, types, zip, region, department, sousType } = getStructure(values?.structure || {});
            const { user, token, code, ok } = await api.post(`/referent/signup`, {
              firstName,
              lastName,
              email,
              password,
              acceptCGU,
              phone,
              name,
              description,
              legalStatus,
              types,
              zip,
              region,
              department,
              sousType,
            });
            if (!ok) {
              if (code === "PASSWORD_NOT_VALIDATED")
                return toastr.error(
                  "Mot de passe incorrect",
                  "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole",
                  { timeOut: 10000 },
                );
              if (code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
              return toastr.error("Un problème est survenu lors de la création de votre compte.", translate(code));
            }
            setNewUser(user);
            if (token) api.setToken(token);
          } catch (e) {
            if (e && e.code === "USER_ALREADY_REGISTERED") return toastr.error("Le compte existe déja. Veuillez vous connecter");
            capture(e);
            toastr.error("Oups, une erreur est survenue", translate(e?.code), { timeOut: 3000 });
            actions.setSubmitting(false);
            console.log("e", e);
          }
        }}>
        {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <div className="mx-auto w-[1100px] p-8">
              <div className="space-y-4 text-center text-brand-grey">
                <h1 className="text-3xl font-bold text-brand-black">Inscrivez votre structure d&apos;accueil</h1>
                <p>A destination des structures souhaitant accueillir des volontaires</p>
                <p>
                  Vous avez déjà un compte ?{" "}
                  <Link to="/auth" className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline">
                    Connectez-vous.
                  </Link>
                </p>
              </div>

              <div className="mx-auto my-4 flex w-full gap-4">
                {/* left form */}
                <form onSubmit={handleSubmit} className="w-1/2 space-y-4 rounded-lg bg-white p-4 shadow-xl">
                  <h2 className="m-0 text-base font-normal text-brand-grey">INFORMATIONS SUR LE RESPONSABLE DE STRUCTURE</h2>
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1 text-red-500">*</span>ADRESSE EMAIL
                    </label>
                    <Field
                      className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                      validate={(v) => (!v && "Ce champ est obligatoire") || (!validator.isEmail(v) && "Veuillez renseigner votre email")}
                      name="user.email"
                      type="email"
                      value={values.user.email}
                      onChange={handleChange}
                      placeholder="Email"
                      haserror={errors.user?.email}
                    />
                    <p className="text-xs text-red-500">{errors.user?.email}</p>
                  </div>
                  <div className="flex w-full gap-4">
                    <div className="w-1/2">
                      <label htmlFor="firstName" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                        <span className="mr-1 text-red-500">*</span>Prénom
                      </label>
                      <Field
                        className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                        validate={(v) => !v && "Ce champ est obligatoire"}
                        name="user.firstName"
                        id="firstName"
                        value={values.user.firstName}
                        onChange={handleChange}
                        placeholder="Prénom"
                        haserror={errors.user?.firstName}
                      />
                      <p className="text-xs text-red-500">{errors.user?.firstName}</p>
                    </div>
                    <div className="w-1/2">
                      <label htmlFor="lastName" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                        <span className="mr-1 text-red-500">*</span>Nom
                      </label>
                      <Field
                        className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                        validate={(v) => !v && "Ce champ est obligatoire"}
                        name="user.lastName"
                        id="lastName"
                        value={values.user.lastName}
                        onChange={handleChange}
                        placeholder="Nom"
                        haserror={errors.user?.lastName}
                      />
                      <p className="text-xs text-red-500">{errors.user?.lastName}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label htmlFor="phone" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1 text-red-500">*</span>Téléphone
                    </label>
                    <Field
                      className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                      name="user.phone"
                      type="tel"
                      id="phone"
                      value={values.user.phone}
                      onChange={handleChange}
                      placeholder="06/02 00 00 00 00"
                      validate={(v) =>
                        (!v && requiredMessage) || (!isPossiblePhoneNumber(v, "FR") && "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX")
                      }
                    />
                    <p className="text-xs text-red-500">{errors.user?.phone}</p>
                  </div>
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1 text-red-500">*</span>Mot de passe
                    </label>
                    <p className="mb-2 text-xs text-brand-grey">👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
                    <PasswordEye autoComplete="new-password" value={values.user.password} onChange={handleChange} name="user.password" />
                    <p className="text-xs text-red-500">{errors.user?.password}</p>
                  </div>
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1 text-red-500">*</span>Confirmation mot de passe
                    </label>
                    <PasswordEye
                      validate={() => values.user.password !== values.user.repassword && "Les mots de passe ne correspondent pas."}
                      autoComplete="new-password"
                      value={values.user.repassword}
                      onChange={handleChange}
                      name="user.repassword"
                      placeholder="Confirmez votre mot de passe"
                    />
                    <p className="text-xs text-red-500">{errors.user?.repassword}</p>
                  </div>
                </form>

                {/* right form */}
                <form onSubmit={handleSubmit} className="w-1/2 space-y-4 rounded-lg bg-white p-4 shadow-xl">
                  <h2 className="m-0 text-base font-normal text-brand-grey">INFORMATIONS SUR LA STRUCTURE</h2>
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1 text-red-500">*</span>NOM DE LA STRUCTURE
                    </label>
                    <Field
                      className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                      validate={(v) => !v && "Ce champ est obligatoire"}
                      value={values.structure.name}
                      onChange={handleChange}
                      name="structure.name"
                      placeholder="Nom de votre structure"
                    />
                    <p className="text-xs text-red-500">{errors.structure?.name}</p>
                  </div>
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">DESCRIPTION DE LA STRUCTURE</label>
                    <Field
                      className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                      as="textarea"
                      value={values.structure.description}
                      onChange={handleChange}
                      name="structure.description"
                      placeholder="Description..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1 text-red-500">*</span>STATUT JURIDIQUE
                    </label>
                    <Field
                      className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                      validate={(v) => !v && "Ce champ est obligatoire"}
                      component="select"
                      name="structure.legalStatus"
                      value={values.structure.legalStatus}
                      onChange={handleChange}>
                      <option value={null} disabled selected>
                        Statut juridique
                      </option>
                      {legalStatus.map((status) => (
                        <option key={status} value={status} label={translate(status)}>
                          {translate(status)}
                        </option>
                      ))}
                    </Field>
                    <p className="text-xs text-red-500">{errors.structure?.legalStatus}</p>
                  </div>
                  {values.structure.legalStatus === "ASSOCIATION" && (
                    <div>
                      <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">DISPOSEZ-VOUS D&apos;UN AGRÉMENT ?</label>
                      <MultiSelect
                        value={values.structure.types}
                        onChange={handleChange}
                        name="structure.types"
                        options={typesStructure.ASSOCIATION}
                        placeholder="Sélectionnez un ou plusieurs agréments"
                      />
                    </div>
                  )}
                  {values.structure.legalStatus === "PRIVATE" && (
                    <div>
                      <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                        <span className="mr-1 text-red-500">*</span>TYPE DE STRUCTURE PRIVÉE
                      </label>
                      <Field
                        className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                        validate={(v) => (!v || !v?.length) && "Ce champ est obligatoire"}
                        component="select"
                        name="structure.types"
                        value={values.structure.types}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange({ target: { value: [value], name: "structure.types" } });
                        }}>
                        <option key="" value="" selected disabled>
                          Type de structure privée
                        </option>
                        {typesStructure.PRIVATE.map((e) => {
                          return (
                            <option key={e} value={e}>
                              {translate(e)}
                            </option>
                          );
                        })}
                      </Field>
                      <p className="text-xs text-red-500">{errors.structure?.types}</p>
                    </div>
                  )}
                  {values.structure.legalStatus === "PUBLIC" && (
                    <>
                      <div>
                        <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                          <span className="mr-1 text-red-500">*</span>TYPE DE STRUCTURE PUBLIQUE
                        </label>
                        <Field
                          className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                          validate={(v) => (!v || !v?.length) && "Ce champ est obligatoire"}
                          component="select"
                          name="structure.types"
                          value={values.structure.types}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange({ target: { value: [value], name: "structure.types" } });
                          }}>
                          <option key="" value="" selected disabled>
                            Type de structure publique
                          </option>
                          {typesStructure.PUBLIC.map((e) => {
                            return (
                              <option key={e} value={e}>
                                {translate(e)}
                              </option>
                            );
                          })}
                        </Field>
                        <p className="text-xs text-red-500">{errors.structure?.types}</p>
                      </div>
                      {values.structure?.types?.some((t) =>
                        ["Collectivité territoriale", "Etablissement scolaire", "Etablissement public de santé", "Corps en uniforme"].includes(t),
                      ) && (
                        <div>
                          <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                            <span className="mr-1 text-red-500">*</span>SOUS-TYPE DE STRUCTURE
                          </label>
                          <Field
                            className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                            validate={(v) => !v && "Ce champ est obligatoire"}
                            component="select"
                            name="structure.sousType"
                            value={values.structure.sousType}
                            onChange={handleChange}>
                            <option key="" value="" selected disabled>
                              Type de service de l&apos;état
                            </option>
                            {sousTypesStructure[values.structure.types].map((e) => {
                              return (
                                <option key={e} value={e}>
                                  {translate(e)}
                                </option>
                              );
                            })}
                          </Field>
                          <p className="text-xs text-red-500">{errors.structure?.sousType}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1 text-red-500">*</span>Code postal de la structure
                    </label>
                    <Field
                      className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                      validate={(v) => (!v && requiredMessage) || (!validator.isPostalCode(v, "FR") && "Ce champ est au mauvais format. Exemples de format attendu : 44000, 08300")}
                      value={values.structure.zip}
                      onChange={handleChange}
                      name="structure.zip"
                      placeholder="44000"
                    />
                    <p className="text-xs text-red-500">{errors.structure?.zip}</p>
                  </div>
                </form>
              </div>

              <div className="my-6">
                <div className="flex items-center gap-2">
                  <Field
                    className="rounded border-brand-grey text-brand-purple focus:ring-offset-0"
                    id="checkboxCGU"
                    validate={(v) => !v && "Ce champ est obligatoire"}
                    type="checkbox"
                    value="true"
                    onChange={(e) => handleChange({ target: { name: "user.acceptCGU", value: e.target.checked ? "true" : "false" } })}
                    name="user.acceptCGU"
                    checked={values.user.acceptCGU === "true"}
                  />
                  <label htmlFor="checkboxCGU" className="mb-0 flex-1 text-brand-grey">
                    J&apos;ai lu et j&apos;accepte les{" "}
                    <a
                      href={`${adminURL}/conditions-generales-utilisation`}
                      target="_blank"
                      className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline"
                      rel="noreferrer">
                      conditions générales d&apos;utilisation
                    </a>{" "}
                    de la plateforme du Service national universel
                  </label>
                </div>
                <p className="text-xs text-red-500">{errors.user?.acceptCGU}</p>
              </div>
              <LoadingButton className="!rounded-xl border-0 py-2 px-5 text-base font-medium transition-colors" loading={isSubmitting} type="submit" onClick={handleSubmit}>
                S&apos;inscrire
              </LoadingButton>
            </div>
          );
        }}
      </Formik>
    </div>
  );
}
