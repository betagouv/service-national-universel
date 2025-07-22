import { Field, Formik } from "formik";
import React from "react";
import { toast } from "react-hot-toast";
import { capture } from "../../sentry";
import API from "../../services/api";

export const CreateAgent = () => {
  const roles = ["AGENT", "REFERENT_DEPARTMENT", "REFERENT_REGION", "DG"];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 justify-center">
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <h4 className="mb-6 w-full text-center text-xl font-bold text-black">Créer Agent</h4>
          <Formik
            initialValues={{ firstName: "", lastName: "", email: "", role: "" }}
            onSubmit={async (values, actions) => {
              try {
                const res = await API.post({ path: `/agent/`, body: values });
                if (!res.ok) throw res;
                toast.success("Agent créé avec succès !");
                actions.resetForm();
              } catch (e) {
                capture(e);
                toast.error("Un problème est survenu lors de la création de l'agent");
              }
              actions.setSubmitting(false);
            }}
          >
            {({ values, isSubmitting, handleChange, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="input-label">Prénom</label>
                      <Field name="firstName" type="text" id="firstName" value={values.firstName} onChange={handleChange} className="input-field" placeholder="ex. John" />
                    </div>

                    <div>
                      <label className="input-label">Nom</label>
                      <Field name="lastName" type="text" id="lastName" value={values.lastName} onChange={handleChange} className="input-field" placeholder="ex. Doe" />
                    </div>
                    <div>
                      <label className="input-label">Email</label>
                      <Field name="email" type="email" id="email" value={values.email} onChange={handleChange} className="input-field" placeholder="ex. agent@mail.com" />
                    </div>
                    <div>
                      <label className="input-label">Role</label>
                      <Field as="select" name="role" className="input-field">
                        <option value="">Choisir un role</option>
                        {roles.map((role, index) => (
                          <option key={index} value={role}>
                            {role}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="auth-button-primary">
                      Créer Agent
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};
