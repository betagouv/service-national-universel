import React from "react";
import { translate as t, TRANSPORT } from "../../../../utils";
import IconDomainRounded from "../../../../components/IconDomainRounded";
import CheckboxInput from "../../../../assets/checkboxInput.svg";
import CheckboxUnchecked from "../../../../assets/checkboxUnchecked.svg";
import ToggleChecked from "../../../../assets/toggleChecked.svg";
import ToggleUnchecked from "../../../../assets/toggleUnchecked.svg";
import BorderBottom from "../../../../assets/borderBottom.svg";

export default function Preferences({ young }) {
  const transportArray = [TRANSPORT.PUBLIC_TRANSPORT, TRANSPORT.BIKE, TRANSPORT.MOTOR, TRANSPORT.CARPOOLING, TRANSPORT.OTHER];
  return (
    <div className="flex flex-col items-center justify-center">
      {/* bloc1 */}
      <div className="flex items-center flex-col mt-7  ">
        <div className="flex w-full justify-center space-x-7 mb-4">
          <div className="flex basis-[40%] flex-col border-[1px] border-gray-200 px-[13px] py-[9px] rounded-md">
            {" "}
            <div className="text-xs text-gray-500">Projet professionnel</div>
            {young.professionnalProject ? (
              <div className="text-sm text-gray-800">{t(young.professionnalProject)}</div>
            ) : (
              <div className="text-sm text-gray-800">Non renseigné</div>
            )}{" "}
          </div>
          <div className="flex basis-[40%] flex-col border-[1px] border-gray-200 px-[13px] py-[9px] rounded-md">
            <div className="text-xs text-gray-500">Précisez</div>
            {young.professionnalProjectPrecision ? (
              <div className="text-sm text-gray-800">{t(young.professionnalProjectPrecision)}</div>
            ) : (
              <div className="text-sm text-gray-800">Non renseigné</div>
            )}{" "}
          </div>
        </div>
        <div className="flex w-full justify-center space-x-7">
          {" "}
          <div className="flex basis-[40%] justify-between px-[13px] py-[9px]">
            <div className="text-sm text-gray-500 font-bold text-[#242526] ">Bénévole en parallèle ?</div>
            {/* Toggle button */}
            {young.engaged && young.engaged === "true" ? (
              <div className="flex space-x-2">
                <img src={ToggleChecked} />
                <div className="text-sm text-gray-700">Oui</div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <img src={ToggleUnchecked} />
                <div className="text-sm text-gray-700">Non </div>
              </div>
            )}
          </div>
          <div className="flex basis-[40%] flex-col border-[1px] border-gray-200 px-[13px] py-[9px] rounded-md">
            <div className="text-xs text-gray-500">Description de l'activité</div>
            {young.engaged && <div className="text-sm text-gray-800">{young.engagedDescription}</div>}
          </div>
        </div>

        <img className="my-11" src={BorderBottom} />
      </div>
      {/* bloc2 */}
      <div className="flex items-center flex-col ">
        <div className="text-sm font-bold text-[#242526] mb-7 ">Domaines favoris</div>
        <div className="flex items-center justify-center space-x-12">
          {young.domains.map((domain, index) => {
            return (
              <div key={index} className="flex flex-col items-center">
                <IconDomainRounded domain={domain} />
                <div className="text-xs text-gray-700 font-medium lowercase mt-2">{domain}</div>
              </div>
            );
          })}
        </div>
        <img className="my-11" src={BorderBottom} />
      </div>
      {/* bloc3 */}
      <div className="flex items-center flex-col ">
        <div className="text-sm font-bold text-[#242526] mb-7 ">Format préféré</div>
        {young.missionFormat === "CONTINUOUS" ? (
          <div className="flex space-x-4">
            <div className="text-sm font-bold text-gray-700 border-b-2 border-blue-600 py-1">Regroupée sur des journées</div>{" "}
            <div className="text-sm font-medium text-gray-400 py-1">Répartie sur des heures</div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium  text-gray-400 py-1">Regroupée sur des journées</div>{" "}
            <div className="text-sm font-bold text-gray-700 border-b-2 border-blue-600 py-1">Répartie sur des heures</div>
          </div>
        )}
        <img className="my-11" src={BorderBottom} />
      </div>
      {/* bloc4 */}
      <div className="flex items-center flex-col ">
        <div className="text-sm font-bold text-[#242526] mb-7 ">Période de réalisation de la mission</div>
        <div className="flex space-x-3 mb-4 flex-col">
          <div className="flex space-x-4 items-center mb-4">
            <div className={young.period === "DURING_HOLIDAYS" ? "font-bold text-sm text-gray-700 border-b-2 border-blue-600 py-1" : "font-medium text-sm text-gray-400"}>
              Sur les vacances scolaires
            </div>
            <div className={young.period === "DURING_SCHOOL" ? "font-bold text-sm text-gray-700 border-b-2 border-blue-600 py-1" : "font-medium text-sm text-gray-400"}>
              Sur le temps scolaire
            </div>
          </div>
          {young.periodRanking && (
            <div>
              {young.periodRanking.map((p, i) => (
                <div key={i} style={{ marginLeft: "1rem" }}>{`${i + 1}. ${t(p)}`}</div>
              ))}{" "}
            </div>
          )}
        </div>
        <img className="my-11" src={BorderBottom} />
      </div>
      {/* bloc5 */}
      <div className="flex items-center flex-col mb-20">
        <div className="text-sm font-bold text-[#242526] mb-7 ">Moyen(s) de transport privilégié(s)</div>
        <div className="flex space-x-3 mb-4">
          {transportArray.map((transport, index) => {
            const indexOf = young.mobilityTransport.indexOf(transport);

            return (
              <div
                key={index}
                className={
                  indexOf !== -1
                    ? "text-blue-600 text-xs border-[1px] border-blue-600 rounded-full font-medium px-4 py-1"
                    : "text-gray-400 text-xs border-[1px] border-gray-400 rounded-full px-4 py-1"
                }>
                {t(transport)}
              </div>
            );
          })}
        </div>
        <div className="text-sm font-bold text-[#242526] mb-7 ">Périmètre de recherche</div>
        <div className="flex space-x-7">
          <div>
            <input id="main-address" name="main-address" type="radio" checked={young.mobilityNearHome === "true"} className="hidden" />
            <label htmlFor="main-address" className="mr-2">
              {young.mobilityNearHome === "true" ? <img src={CheckboxInput} /> : <img src={CheckboxUnchecked} />}
            </label>
            <label htmlFor="main-address" className="cursor-pointer">
              <span className="text-[13px] text-gray-700">Autour de mon adresse principale</span>
              <br />
              <span className="text-[15px] text-gray-700">{young.city}</span>
            </label>
          </div>
          <div>
            <input id="school-address" name="school-address" type="radio" checked={young.mobilityNearSchool === "true"} className="hidden" />
            <label htmlFor="school-address" className="mr-2">
              {young.mobilityNearSchool === "true" ? <img src={CheckboxInput} /> : <img src={CheckboxUnchecked} />}
            </label>
            <label htmlFor="school-address" className="cursor-pointer">
              <span className="text-[13px] text-gray-700">Autour de l'établissement</span>
              <br />
              <span className="text-[15px] text-gray-700">{young.schoolCity}</span>
            </label>
          </div>
          <div>
            {young.mobilityNearRelativeCity ? (
              <div className="flex items-center gap-2">
                <input id="second-address" name="address" type="checkbox" checked={young.mobilityNearRelative === "true"} className="hidden" />
                <label htmlFor="second-address" className="mr-2">
                  {young.mobilityNearRelative === "true" ? <img src={CheckboxInput} /> : <img src={CheckboxUnchecked} />}
                </label>
                <label htmlFor="second-address" className="cursor-pointer">
                  <span className="text-[13px] text-gray-700">Autour de l&apos;adresse de mon proche</span>
                  <br />
                  <span className="text-[15px] text-gray-700">{young.mobilityNearRelativeCity}</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input id="second-address" name="address" type="checkbox" value={young.city} disabled />
                <label htmlFor="second-address">
                  <span className="text-[13px] text-gray-400">Autour de l&apos;adresse de mon proche</span>
                  <br />
                  <Link to="/preferences" className="text-[15px] text-blue-600 underline hover:underline">
                    Renseigner une adresse
                  </Link>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
