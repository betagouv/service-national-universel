import React, { Fragment } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";

import { classNames } from "../../utils";

export default function OpeningTime() {
  return (
    <Fragment>
      <Header />
      <Schedule />
      <Message />
      <div className="flex justify-center">
        <button className="my-14 h-[50px] rounded-md border border-gray-300 bg-white px-6 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50">
          Ajouter un message d’absence
        </button>
      </div>
    </Fragment>
  );
}

const Header = () => {
  return (
    <div className="mb-8 pl-[22px]">
      <span className="text-sm font-medium uppercase text-gray-500">Tickets</span>
      <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Horaires d’ouverture</h4>
    </div>
  );
};

const Schedule = () => {
  const Day = ({ name }) => (
    <button type="button" className={classNames("bg-purple-100 text-purple-800", "rounded-md  px-2.5 py-1.5 text-base font-medium ")}>
      {name}
    </button>
  );

  return (
    <div className="mb-8 divide-y divide-gray-200 rounded-lg bg-white shadow">
      <div className="px-6 py-5 text-lg font-medium text-gray-900">Jours et horaires d’ouverture et fermeture</div>
      <div className="flex items-center px-6 py-5">
        <span className="w-full max-w-[280px] flex-none text-sm font-medium text-gray-500">Jours d’ouverture</span>
        <div className="flex gap-2.5">
          <Day name="Lundi" />
          <Day name="Mardi" />
          <Day name="Mercredi" />
          <Day name="Jeudi" />
          <Day name="Vendredi" />
          <Day name="Samedi" />
          <Day name="Dimanche" />
        </div>
      </div>
      <div className="flex px-6 py-5">
        <span className="w-full max-w-[280px] flex-none text-sm font-medium text-gray-500">Horaires d’ouverture</span>
        <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-4">
          <Fragment>
            <div className="flex h-[54px] w-[132px] flex-col justify-center rounded-md border border-gray-300 bg-white px-3.5">
              <p className="text-xs font-medium text-gray-700">De</p>
              <p className="text-xs font-medium text-gray-500">8h30</p>
            </div>
            <div className="flex h-[54px] w-[132px] flex-col justify-center rounded-md border border-gray-300 bg-white px-3.5">
              <p className="text-xs font-medium text-gray-700">À</p>
              <p className="text-xs font-medium text-gray-500">12h30</p>
            </div>
            <div className="ml-1.5 flex items-center gap-2">
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50">
                <HiMinus />
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50">
                <HiPlus />
              </button>
            </div>
          </Fragment>

          <Fragment>
            <div className="flex h-[54px] w-[132px] flex-col justify-center rounded-md border border-gray-300 bg-white px-3.5">
              <p className="text-xs font-medium text-gray-700">De</p>
              <p className="text-xs font-medium text-gray-500">8h30</p>
            </div>
            <div className="flex h-[54px] w-[132px] flex-col justify-center rounded-md border border-gray-300 bg-white px-3.5">
              <p className="text-xs font-medium text-gray-700">À</p>
              <p className="text-xs font-medium text-gray-500">12h30</p>
            </div>
            <div className="ml-1.5 flex items-center gap-2">
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50">
                <HiMinus />
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-base text-gray-700 transition-colors hover:bg-gray-50">
                <HiPlus />
              </button>
            </div>
          </Fragment>
        </div>
      </div>
    </div>
  );
};

const Message = () => {
  return (
    <div className="divide-y divide-gray-200 rounded-lg bg-white shadow">
      <div className="px-6 py-5 text-lg font-medium text-gray-900">Message d’absence</div>
      <div className="flex flex-col gap-12 p-6">
        <div className="flex">
          <span className="w-full max-w-[280px] flex-none text-sm font-medium text-gray-500">Emetteur</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="w-32 select-none text-sm font-medium text-gray-700">Comments</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="w-32 select-none text-sm font-medium text-gray-700">Référents</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="w-32 select-none text-sm font-medium text-gray-700">Admin</span>
            </label>
          </div>
        </div>
        <div className="flex">
          <span className="w-full max-w-[280px] flex-none text-sm font-medium text-gray-500">Canal</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="w-32 select-none text-sm font-medium text-gray-700">E-mail</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="w-32 select-none text-sm font-medium text-gray-700">Formulaire</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex p-6">
        <span className="w-full max-w-[280px] flex-none text-sm font-medium text-gray-500">Horaires d’ouverture</span>
        <textarea
          rows={4}
          className="block w-full rounded-md border-gray-300 bg-white py-5 px-8 text-lg text-gray-800 shadow-sm placeholder:text-gray-500 focus:border-gray-400"
          defaultValue={""}
          placeholder="Votre message d’absence"
        />
      </div>

      <div className="flex justify-end gap-3 px-9 pt-5 pb-8">
        <button type="button" className="h-[38px] rounded-md border border-gray-300 px-4 text-sm font-medium text-custom-red transition-colors hover:bg-red-50">
          Supprimer
        </button>
        <button type="button" className="h-[38px] rounded-md  bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
          Enregistrer
        </button>
      </div>
    </div>
  );
};
