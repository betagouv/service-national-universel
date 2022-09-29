import React from "react";
import { BsCheck2 } from "react-icons/bs";
import AcademicCap from "../../../../assets/icons/AcademicCap";
import Calendar from "../../../../assets/icons/Calendar";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import Sun from "../../../../assets/icons/Sun";
import IconDomainRounded from "../../../../components/IconDomainRounded";
import { MISSION_DOMAINS, PERIOD, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION, translate as t, TRANSPORT } from "../../../../utils";
import ModalPreference from "../../components/ModalPreference";
import RankingPeriod from "../../components/rankingPeriod";
import Pencil from "../../../../assets/icons/Pencil";
import Loader from "../../../../components/Loader";

export default function Preferences({
  young,
  data,
  setData,
  editPreference,
  savePreference,
  onSubmit,
  errorMessage,
  setErrorMessage,
  openDesiredLocation,
  setOpenDesiredLocation,
}) {
  const [openProject, setOpenProject] = React.useState(false);
  const [openProjectPrecision, setOpenProjectPrecision] = React.useState(false);
  const [hasRelativeAddress, setHasRelativeAddress] = React.useState(false);
  const [modal, setModal] = React.useState({});
  const refProject = React.useRef();
  const refProjectPrecision = React.useRef();

  React.useEffect(() => {
    setOpenDesiredLocation(false);
  }, [editPreference]);

  React.useEffect(() => {
    setHasRelativeAddress(data?.mobilityNearRelativeAddress && data?.mobilityNearRelativeZip && data?.mobilityNearRelativeCity && data?.mobilityNearRelativeName);
  }, [data]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refProject.current && !refProject.current.contains(event.target)) {
        setOpenProject(false);
      }
      if (refProjectPrecision.current && !refProjectPrecision.current.contains(event.target)) {
        setOpenProjectPrecision(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const getIconPeriod = (period) => {
    switch (period) {
      case PERIOD.WHENEVER:
        return null;
      case PERIOD.DURING_HOLIDAYS:
        return Sun;
      case PERIOD.DURING_SCHOOL:
        return AcademicCap;
      case PERIOD.PERSONALIZED:
        return Calendar;
      default:
        return null;
    }
  };
  return savePreference ? (
    <Loader />
  ) : (
    <div className="flex flex-col mx-5">
      <div className="flex flex-row gap-4 items-end mt-3 w-full">
        {!editPreference ? (
          <div className="border-[1px] border-gray-300 w-1/2 px-3 py-2 rounded-lg ">
            <div className="text-xs leading-4 font-normal text-gray-500">Projet professionnel</div>
            <div className="w-full text-sm leading-5 font-normal">{data?.professionnalProject ? t(data.professionnalProject) : "Non renseigné"}</div>
          </div>
        ) : (
          <div className="border-[1px] border-gray-300 w-1/2 rounded-lg px-3 py-2 ">
            <div className="text-xs leading-4 font-normal text-gray-500">Projet professionnel</div>
            <div className="relative" ref={refProject}>
              <button className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full" onClick={() => setOpenProject((e) => !e)}>
                <div className="flex items-center gap-2">
                  {data?.professionnalProject ? (
                    <span className="text-sm leading-5 font-normal">{t(data?.professionnalProject)}</span>
                  ) : (
                    <span className="text-gray-400 text-sm font-normal">Projet professionnel</span>
                  )}
                </div>
                <ChevronDown className="text-gray-400" />
              </button>
              {/* display options */}
              <div className={`${openProject ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[30px]`}>
                {Object.values(PROFESSIONNAL_PROJECT).map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setData({ ...data, professionnalProject: option, professionnalProjectPrecision: "" });
                      setOpenProject(false);
                      setErrorMessage({});
                    }}
                    className={`${option === data?.professionnalProject && "font-bold bg-gray"}`}>
                    <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                      <div>{t(option)}</div>
                      {option === data?.professionnalProject ? <BsCheck2 /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col w-1/2 ">
          {editPreference && errorMessage.errorProject && <div className="text-red-500 text-xs mb-2">{errorMessage.errorProject}</div>}
          {!editPreference && data?.professionnalProjectPrecision ? (
            <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg ">
              <div className="text-xs leading-4 font-normal text-gray-500">Précisez</div>
              <div className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent">
                {t(data.professionnalProjectPrecision) ? t(data.professionnalProjectPrecision) : "Non renseigné"}
              </div>
            </div>
          ) : editPreference && data?.professionnalProject === PROFESSIONNAL_PROJECT.OTHER ? (
            <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg ">
              <div className="text-xs leading-4 font-normal text-gray-500">Précisez</div>
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
                type="text"
                value={data.professionnalProjectPrecision}
                onChange={(e) => setData({ ...data, professionnalProjectPrecision: e.target.value })}
              />
            </div>
          ) : editPreference && data?.professionnalProject === PROFESSIONNAL_PROJECT.UNIFORM ? (
            <div className="border-[1px] border-gray-300 w-full rounded-lg px-3 py-2 ">
              <div className="text-xs leading-4 font-normal text-gray-500">Précisez</div>
              <div className="relative" ref={refProjectPrecision}>
                <button
                  className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full"
                  onClick={() => setOpenProjectPrecision((e) => !e)}>
                  <div className="flex items-center gap-2">
                    {data?.professionnalProjectPrecision ? (
                      <span className="text-sm leading-5 font-normal">{t(data?.professionnalProjectPrecision)}</span>
                    ) : (
                      <span className="text-gray-400 text-sm font-normal">Projet professionnel</span>
                    )}
                  </div>
                  <ChevronDown className="text-gray-400" />
                </button>
                {/* display options */}
                <div className={`${openProjectPrecision ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[30px]`}>
                  {Object.values(PROFESSIONNAL_PROJECT_PRECISION).map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setData({ ...data, professionnalProjectPrecision: option });
                        setOpenProjectPrecision(false);
                        setErrorMessage({});
                      }}
                      className={`${option === data?.professionnalProjectPrecision && "font-bold bg-gray"}`}>
                      <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                        <div>{t(option)}</div>
                        {option === data?.professionnalProjectPrecision ? <BsCheck2 /> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-row w-full gap-4 items-center mt-4">
        <div className="flex w-1/2 items-center gap-10">
          <div className="flex mr-2 items-center">
            <div className="font-bold">
              Avez-vous déjà une idée de là où vous voudriez <br /> réaliser votre mission d’intérêt général ?
            </div>
          </div>
          {data.desiredLocation || openDesiredLocation ? (
            <div
              onClick={() => {
                if (!editPreference) return;
                setOpenDesiredLocation(false);
                setData({ ...data, desiredLocation: "" });
              }}
              name="visibility"
              className={`flex items-center w-9 h-4 rounded-full bg-blue-600 transition duration-100 ease-in ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <div className="flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] translate-x-[16px] transition duration-100 ease-in shadow-nina"></div>
            </div>
          ) : (
            <div
              onClick={() => editPreference && setOpenDesiredLocation(true)}
              name="visibility"
              className={`flex items-center w-9 h-4 rounded-full bg-gray-200 transition duration-100 ease-in ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <div className="flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] translate-x-0 transition duration-100 ease-in shadow-nina"></div>
            </div>
          )}
        </div>
        <div className="flex w-1/2 items-center gap-10">
          <div className="flex mr-2 items-center">
            <div className="font-bold">Bénévole en parallèle ?</div>
          </div>
          {data.engaged === "true" ? (
            <div
              onClick={() => editPreference && setData({ ...data, engaged: "false" })}
              name="visibility"
              className={`flex items-center w-9 h-4 rounded-full bg-blue-600 transition duration-100 ease-in ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <div className="flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] translate-x-[16px] transition duration-100 ease-in shadow-nina"></div>
            </div>
          ) : (
            <div
              onClick={() => editPreference && setData({ ...data, engaged: "true" })}
              name="visibility"
              className={`flex items-center w-9 h-4 rounded-full bg-gray-200 cursor-pointer transition duration-100 ease-in ${
                !editPreference ? "cursor-not-allowed" : "cursor-pointer"
              }`}>
              <div className="flex justify-center items-center h-5 w-5 rounded-full border-[1px] border-gray-200 bg-[#ffffff] translate-x-0 transition duration-100 ease-in shadow-nina"></div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row w-full gap-4 items-end mt-4">
        <div className="w-1/2">
          {openDesiredLocation && errorMessage.desiredLocation && <div className="text-red-500 text-xs mb-2">{errorMessage.desiredLocation}</div>}
          {openDesiredLocation || data.desiredLocation ? (
            <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg ">
              <div className="text-xs leading-4 font-normal text-gray-500">Endroit où je souhaite effectuer ma mission</div>
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
                type="text"
                placeholder={data?.desiredLocation ? "" : "Non renseigné"}
                disabled={!editPreference}
                value={data.desiredLocation}
                onChange={(e) => setData({ ...data, desiredLocation: e.target.value })}
              />
            </div>
          ) : null}
        </div>
        <div className="w-1/2">
          {data.engaged === "true" && errorMessage.engaged && <div className="text-red-500 text-xs mb-2">{errorMessage.engaged}</div>}
          {data.engaged === "true" ? (
            <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg ">
              <div className="text-xs leading-4 font-normal text-gray-500">Description de l’activité</div>
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
                type="text"
                placeholder={data?.engagedDescription ? "" : "Non renseigné"}
                disabled={!editPreference}
                value={data.engagedDescription}
                onChange={(e) => setData({ ...data, engagedDescription: e.target.value })}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col w-full gap-4 items-center justify-center mt-4 border-t-[1px] border-b-[1px] py-14">
        <div className="leading-5 font-bold text-sm">Domaines favoris</div>
        {!editPreference ? (
          data.domains.length > 0 ? (
            <div className="flex flex-row items-start justify-start gap-4 mt-3">
              {data.domains.map((domain, index) => {
                return (
                  <div key={index} className="flex flex-col items-center space-y-2 w-20">
                    <IconDomainRounded bgStyle="bg-[#212B44]" domain={domain} />
                    <div className="text-xs text-gray-700 text-center">{t(domain)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-700 text-center">Aucun domaine renseigné</div>
          )
        ) : (
          <div className="flex flex-row items-start justify-start gap-4 mt-3">
            {Object.values(MISSION_DOMAINS).map((domain, index) => {
              return (
                <div
                  key={index}
                  className="group flex flex-col items-center space-y-2 w-20 cursor-pointer"
                  onClick={() => {
                    let result = data.domains;
                    if (result.length >= 3) result.splice(0, 1);
                    result.push(domain);
                    setData({ ...data, domains: result });
                  }}>
                  <div className="group-hover:-translate-y-1 transition duration-200 ease-in">
                    <IconDomainRounded domain={domain} bgStyle={data.domains.includes(domain) ? "bg-[#212B44]" : "bg-gray-200"} />
                  </div>
                  <div className="text-xs text-gray-700 text-center">{t(domain)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex flex-col w-full gap-4 items-center justify-center border-b-[1px] py-14">
        <div className="leading-5 font-bold text-sm">Format préféré</div>
        <div className="flex space-x-4 mt-2">
          <div
            className={`text-sm py-1 ${data.missionFormat === "CONTINUOUS" ? "border-b-2 border-blue-600 text-gray-700 font-bold" : "font-medium text-gray-400 "} ${
              editPreference ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            onClick={() => editPreference && setData({ ...data, missionFormat: "CONTINUOUS" })}>
            Regroupée sur des journées
          </div>
          <div
            className={`text-sm py-1 ${data.missionFormat === "DISCONTINUOUS" ? "border-b-2 border-blue-600 text-gray-700 font-bold" : "font-medium text-gray-400 "} ${
              editPreference ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            onClick={() => editPreference && setData({ ...data, missionFormat: "DISCONTINUOUS" })}>
            Répartie sur des heures
          </div>
        </div>
        <hr className="w-1/5 my-4" />
        <div className="leading-5 font-bold text-sm">Période de réalisation de la mission</div>
        <div className="flex space-x-4 mt-2">
          {Object.values(PERIOD).map((period, index) => {
            const Icon = getIconPeriod(period);
            return (
              <div key={index} className={`group flex flex-col items-center justify-start space-y-2 py-1 ${editPreference ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <div
                  className={`flex gap-2 items-center text-sm ${data.period === period ? "border-b-2 border-blue-600 text-gray-700 font-bold" : "font-medium text-gray-400 "} `}
                  onClick={() => editPreference && setData({ ...data, period: period })}>
                  {t(period)}
                  {Icon ? <Icon className={data.period === period ? "text-gray-700" : "text-gray-400"} /> : null}
                </div>
              </div>
            );
          })}
        </div>
        {[PERIOD.DURING_HOLIDAYS, PERIOD.DURING_SCHOOL].includes(data.period) ? (
          <div className="flex mt-2 items-center">
            <RankingPeriod handleChange={setData} period={data.period} values={data} name="periodRanking" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col w-full gap-4 items-center justify-center pt-14">
        <div className="leading-5 font-bold text-sm">Moyen(s) de transport privilégié(s)</div>
        <div className="flex flex-row items-start justify-start gap-4 mt-3">
          {Object.values(TRANSPORT).map((transport, index) => {
            return (
              <div
                key={index}
                className={`text-xs border-[1px] rounded-full font-medium px-4 py-1 ${
                  data.mobilityTransport.includes(transport) ? "text-blue-600 border-blue-600" : "text-gray-400 border-gray-400"
                } ${editPreference ? "cursor-pointer" : "cursor-not-allowed"}`}
                onClick={() => {
                  if (editPreference) {
                    let result = data.mobilityTransport;
                    if (result.includes(transport)) result.splice(result.indexOf(transport), 1);
                    else result.push(transport);
                    setData({ ...data, mobilityTransport: result });
                  }
                }}>
                {t(transport)}
              </div>
            );
          })}
        </div>
        {data.mobilityTransport.includes("OTHER") ? (
          <div className="border-[1px] border-gray-300 w-1/3 px-3 py-2 rounded-lg mt-2">
            <div className="text-xs leading-4 font-normal text-gray-500">Précisez</div>
            <input
              className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
              type="text"
              placeholder={data?.mobilityTransportOther ? "" : "Non renseigné"}
              disabled={!editPreference}
              value={data?.mobilityTransportOther}
              onChange={(e) => setData({ ...data, mobilityTransportOther: e.target.value })}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col w-full gap-4 items-center justify-center mt-5 pb-14">
        <div className="leading-5 font-bold text-sm">Périmètre de recherche</div>
        <div className="flex items-center justify-center gap-10 mt-3">
          <div className="flex items-center justify-center gap-4">
            <input
              type="checkbox"
              className={`w-4 h-4 ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}
              checked={data.mobilityNearHome === "true"}
              disabled={!editPreference && data.mobilityNearHome !== "true"}
              onChange={(e) => editPreference && setData({ ...data, mobilityNearHome: e.target.checked ? "true" : "false" })}
            />
            <div className="flex flex-col">
              <div className={`text-sm ${data.mobilityNearHome === "true" ? "text-gray-700" : "text-gray-400"}`}>Autour de l’adresse principale</div>
              <div className={`text-sm ${data.mobilityNearHome === "true" ? "text-gray-700" : "text-gray-400"}`}>{young.city}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <input
              type="checkbox"
              className={`w-4 h-4 ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={!editPreference && data.mobilityNearSchool !== "true"}
              checked={data.mobilityNearSchool === "true"}
              onChange={(e) => editPreference && setData({ ...data, mobilityNearSchool: e.target.checked ? "true" : "false" })}
            />
            <div className="flex flex-col">
              <div className={`text-sm ${data.mobilityNearSchool === "true" ? "text-gray-700" : "text-gray-400"}`}>Autour de l’établissement</div>
              <div className={`text-sm ${data.mobilityNearSchool === "true" ? "text-gray-700" : "text-gray-400"}`}>{young.schoolCity}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <input
              type="checkbox"
              className={`w-4 h-4 ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={!editPreference && data.mobilityNearRelative !== "true"}
              checked={data.mobilityNearRelative === "true"}
              onChange={(e) => editPreference && setData({ ...data, mobilityNearRelative: e.target.checked ? "true" : "false" })}
            />
            <div className="flex flex-col">
              <div className={`text-sm ${data.mobilityNearRelative === "true" ? "text-gray-700" : "text-gray-400"}`}>Autour de l’adresse d’un proche</div>
              {hasRelativeAddress ? (
                <div className={`text-sm ${data.mobilityNearRelative === "true" ? "text-gray-700" : "text-gray-400"}`}>
                  {data.mobilityNearRelativeCity}{" "}
                  {editPreference ? (
                    <span className="text-xs cursor-pointer hover:underline" onClick={() => setModal({ isOpen: true })}>
                      (Modifier)
                    </span>
                  ) : null}
                </div>
              ) : (
                <div
                  className={`text-sm ${editPreference ? "cursor-pointer hover:underline" : ""} ${data.mobilityNearRelative === "true" ? "text-gray-700" : "text-gray-400"}`}
                  onClick={() => editPreference && setModal({ isOpen: true })}>
                  {editPreference ? "Renseigner une adresse" : "Aucune adresse renseignée"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {editPreference ? (
        <div className="flex justify-end items-center gap-4 pb-14">
          <div className="hover:scale-105 flex items-center gap-2 bg-blue-100 rounded-[28px] px-[9px] py-[7px] h-[32px]" onClick={() => onSubmit()}>
            <Pencil className="h-4 w-4 text-blue-600" />
            <div className="text-blue-600 text-xs font-medium cursor-pointer">Enregistrer les changements</div>
          </div>
        </div>
      ) : null}
      <ModalPreference isOpen={modal?.isOpen} onCancel={() => setModal({ isOpen: false })} data={data} setData={setData} />
    </div>
  );
}
