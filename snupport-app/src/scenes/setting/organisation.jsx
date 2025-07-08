import React, { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiPlus, HiX } from "react-icons/hi";
import { useSelector } from "react-redux";
import API from "../../services/api";

export default function Organisation() {
  return (
    <Fragment>
      <Header />
      <Attributes />
    </Fragment>
  );
}

const Header = () => {
  return (
    <div className=" flex items-center justify-between pl-[22px]">
      <div>
        <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Attributs des contacts</h4>
      </div>
    </div>
  );
};

const defaultAttributs = [{ id: 0, type: "", name: "" }];

const Attributes = () => {
  const organisation = useSelector((state) => state.Auth.organisation);

  const [attributes, setAttributes] = useState(organisation?.attributes || defaultAttributs);

  const postAtributes = async () => {
    try {
      const { ok } = await API.patch({ path: `/organisation/${organisation._id}`, body: { attributes } });
      if (ok) toast.success("Ok");
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <div>
      <div className="pt-6 pb-3">
        {attributes.map((item) => (
          <Row
            key={item.id}
            onChange={(e) => setAttributes((prev) => prev.map((elem) => (elem.id === e.id ? e : elem)))}
            onDelete={() => setAttributes((prev) => prev.filter((elem) => elem.id !== item.id))}
            type={item.format}
            name={item.name}
            id={item.id}
          />
        ))}
        <div className="mt-2 flex items-center gap-2">
          <button
            className="flex items-center justify-center gap-1 text-sm hover:underline"
            onClick={() => setAttributes((prev) => [...prev, { type: "", name: "", id: Date.now() }])}
          >
            <HiPlus /> Ajouter un attribut.
          </button>
        </div>
      </div>

      <button className="mt-4 rounded border bg-snu-purple-600 p-2 text-white " onClick={() => postAtributes()}>
        Ajouter les attributs
      </button>
    </div>
  );
};

const Row = ({ type: defaultType, name: defaultName, id, onChange, onDelete }) => {
  const [type, setType] = useState(defaultType);
  const [name, setName] = useState(defaultName);
  useEffect(() => {
    type?.length && name?.length && onChange({ type, name, id });
  }, [type, name]);

  return (
    <div className="my-3 flex flex-col gap-2 sm:mb-0 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-row gap-2">
        <input
          defaultValue={defaultType}
          type="text"
          className="h-10 flex-1 rounded-lg border-gray-200 text-sm text-gray-800 placeholder:text-gray-500 focus:border-gray-300 focus:ring-0"
          placeholder="Type"
          onChange={(e) => setType(e.target.value)}
        />
        <input
          defaultValue={defaultName}
          type="text"
          className="h-10 flex-1 rounded-lg border-gray-200 text-sm text-gray-800 placeholder:text-gray-500 focus:border-gray-300 focus:ring-0"
          placeholder="Nom"
          onChange={(e) => setName(e.target.value)}
        />

        <button className="flex h-10 flex-none items-center justify-center text-gray-800 transition-colors hover:text-red-600" onClick={onDelete}>
          <HiX />
        </button>
      </div>
    </div>
  );
};
