import React from "react";
import { useFieldArray, useForm } from "react-hook-form";

const ROLES = {
  admin: "Admin",
  type1: "Type 1",
  type2: "Type 2",
};

/*
element: { title: string roles: [string] }
*/

const MyForm = ({ element }) => {
  element.roles = Object.keys(ROLES).map((role) => ({
    id: role,
    name: role,
    value: element.roles.includes(role),
  }));

  const { register, control, handleSubmit } = useForm({
    defaultValues: element,
  });

  const { fields } = useFieldArray({ control, name: "roles" });

  const onSubmit = async (body) => {
    body.roles = body.roles.filter(({ value }) => !!value).map((item) => item.id);
    // update in the API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register your input into the hook by invoking the "register" function */}
      <label htmlFor="title">Title</label>
      <input placeholder="Title" {...register("title")} />
      <fieldset>
        <legend>Roles:</legend>
        {Object.keys(ROLES).map((role, index) => (
          <div key={role}>
            <input type="checkbox" {...register(`roles.${index}.value`)} />
            <label htmlFor={`roles.${index}.value`}>{ROLES[role]}</label>
          </div>
        ))}
      </fieldset>
      <button type="submit">Save</button>
    </form>
  );
};

export default MyForm;
