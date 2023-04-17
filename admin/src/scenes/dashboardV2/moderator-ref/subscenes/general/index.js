import React from "react";

import DashboardContainer from "../../../components/DashboardContainer";
import FullDoughnut from "../../../components/graphs/FullDoughnut";
import DemiDoughnut from "../../../components/graphs/DemiDoughnut";
import { Legends } from "../../../components/graphs/graph-commons";
import BarChart from "../../../components/graphs/BarChart";
import RoundRatio from "../../../components/graphs/RoundRatio";
import HorizontalBar from "../../../components/graphs/HorizontalBar";
import InfoMessage from "../../../components/ui/InfoMessage";
import { HiChevronDown, HiChevronRight, HiChevronUp, HiOutlineExclamationCircle, HiOutlineInformationCircle } from "react-icons/hi";
import { IoWarningOutline } from "react-icons/io5";
import Inscription from "../../../components/ui/icons/Inscription";
import Sejour from "../../../components/ui/icons/Sejour";
import Engagement from "../../../components/ui/icons/Engagement";
import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import DatePicker from "../../../../../components/ui/forms/DatePicker";

export default function Index() {
  const [fullNote, setFullNote] = React.useState(false);
  const [fullKeyNumber, setFullKeyNumber] = React.useState(false);
  return (
    <DashboardContainer active="general" availableTab={["general", "engagement", "sejour", "inscription", "analytics"]}>
      <div className="flex flex-col gap-8">
        <InfoMessage
          bg="bg-blue-800"
          Icon={HiOutlineInformationCircle}
          message="Message d’information (white + blue/800), l'instruction des dossiers pour le séjour de février est à finaliser pour ce soir à 23h59."
        />
        <InfoMessage
          bg="bg-yellow-700"
          Icon={HiOutlineExclamationCircle}
          message="Message important (white + yellow/700), l'instruction des dossiers pour le séjour de février est à finaliser pour ce soir à 23h59."
        />
        <InfoMessage
          bg="bg-red-800"
          Icon={IoWarningOutline}
          message="Message urgent  (white + red/800), suite à un problème technique, nous vous invitons à revalider les missions que vous aviez validés entre le 3 janvier 15h et le 4 janvier 8h. Veuillez nous excuser pour le désagrément."
        />
        <h1 className="text-[28px] leading-8 font-bold text-gray-900">En ce moment</h1>
        <div className="flex gap-4">
          <div className={`flex flex-col gap-4 bg-white px-4 py-6 rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] w-[70%] ${!fullNote ? "h-[584px]" : "h-fit"}`}>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Inscription />
                  <div className="text-sm leading-5 font-bold text-gray-900">Inscription</div>
                  <div className=" text-blue-600 text-sm text-medium px-2.5 py-0.5 bg-blue-50 rounded-full leading-none">4</div>
                </div>
                {Array.from(Array(4).keys())
                  .slice(0, fullNote ? 4 : 3)
                  .map((i) => (
                    <NoteContainer key={`inscriptions` + i} title="Dossier" number={2} content="dossier d’inscriptions sont en attente de validation." btnLabel="À instruire" />
                  ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Sejour />
                  <div className="text-sm leading-5 font-bold text-gray-900">Séjour</div>
                  <div className=" text-blue-600 text-sm text-medium px-2.5 py-0.5 bg-blue-50 rounded-full leading-none">7</div>
                </div>
                {Array.from(Array(7).keys())
                  .slice(0, fullNote ? 7 : 3)
                  .map((i) => (
                    <NoteContainer key={`sejour` + i} title="Dossier" number={2} content="dossier d’inscriptions sont en attente de validation." btnLabel="À instruire" />
                  ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Engagement />
                  <div className="text-sm leading-5 font-bold text-gray-900">Engagement</div>
                  <div className=" text-blue-600 text-sm text-medium px-2.5 py-0.5 bg-blue-50 rounded-full leading-none">9</div>
                </div>
                {Array.from(Array(9).keys())
                  .slice(0, fullNote ? 9 : 3)
                  .map((i) => (
                    <NoteContainer key={`engagement` + i} title="Dossier" number={2} content="dossier d’inscriptions sont en attente de validation." btnLabel="À instruire" />
                  ))}
              </div>
            </div>
            <div className="flex justify-center">
              <button className="flex items-center text-sm text-blue-600 gap-1" onClick={() => setFullNote(!fullNote)}>
                <span>{fullNote ? "Voir moins" : "Voir plus"}</span>
                {fullNote ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className={`flex flex-col  bg-white px-4 py-6 rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] w-[30%] ${!fullKeyNumber ? "h-[584px]" : "h-fit"}`}>
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="text-sm leading-5 font-bold text-gray-900">Chiffres clés</div>
                <div className=" text-blue-600 text-sm text-medium px-2.5 py-0.5 bg-blue-50 rounded-full leading-none">22</div>
              </div>
              <FilterPopOver />
            </div>
            <div className="flex flex-col h-full justify-between">
              {Array.from(Array(22).keys())
                .slice(0, fullKeyNumber ? 22 : 7)
                .map((i) => (
                  <div key={`keyNumber` + i} className={`flex items-center border-t-[1px] border-gray-200 gap-4 ${fullKeyNumber ? "py-3" : "h-full"}`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                      <Inscription />
                    </div>
                    <div className="text-sm text-gray-900">
                      3 abandons de <strong>missions</strong>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-center mt-4">
              <button className="flex items-center text-sm text-blue-600 gap-1" onClick={() => setFullKeyNumber(!fullKeyNumber)}>
                <span>{fullKeyNumber ? "Voir moins" : "Voir plus"}</span>
                {fullKeyNumber ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}

const NoteContainer = ({ title, number, content, btnLabel }) => {
  return (
    <div className="flex flex-col justify-between w-full h-36 rounded-lg bg-blue-50 py-4 px-3">
      <div className="flex flex-col gap-2">
        <span className="text-sm leading-5 font-bold text-gray-900">{title}</span>
        <p className="text-xs leading-4 font-normal text-gray-900">
          <span className="font-bold text-blue-600">{number} </span>
          {content}
        </p>
      </div>
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-blue-600 text-white text-xs font-medium rounded-full px-2 py-1">
          <span>{btnLabel}</span>
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const FilterPopOver = () => {
  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-bold text-gray-500 outline-none">
        <span>Filtrer</span>
        <HiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min">
          <div className="w-60 shrink rounded-lg bg-white pt-3 pb-1 text-sm leading-6 ring-1 ring-black ring-opacity-5 shadow-lg">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 px-4 mb-1">Phase</span>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">Tous</span>
              </div>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">Inscription</span>
              </div>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">Séjour</span>
              </div>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">Engagement</span>
              </div>
              <hr className="text-gray-100 my-2" />
              <span className="text-sm text-gray-500 px-4 mb-1">Période</span>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">Les 15 derniers jours</span>
              </div>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">Les 30 derniers jours</span>
              </div>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">La semaine dernière</span>
              </div>
              <div className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer">
                <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
                <span className="text-sm leading-5 font-normal text-gray-700">Le mois dernier</span>
              </div>
              <DatePickerPopOver />
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

const DatePickerPopOver = () => {
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center gap-3 px-4 hover:bg-gray-50 py-1.5 cursor-pointer outline-none w-full">
        <input id="candidates" aria-describedby="candidates-description" name="candidates" type="checkbox" className="cursor-pointer h-4 w-4" />
        <span className="text-sm leading-5 font-normal text-gray-700">Une date spécifique</span>
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min">
          <div className="flex-auto rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 flex ">
            <DatePicker mode="range" fromYear={2022} toYear={2030} />
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
