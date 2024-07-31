import React from "react";
import { BsCheck2 } from "react-icons/bs";
import AcademicCap from "../../../../assets/icons/AcademicCap";
import Calendar from "../../../../assets/icons/Calendar";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import Sun from "../../../../assets/icons/Sun";
import IconDomainRounded from "../../../../components/IconDomainRounded";
import { MISSION_DOMAINS, PERIOD, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION, translate as t, TRANSPORT } from "snu-lib";
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
    <div className="mx-5 flex flex-col pb-16">
      <div className="mt-3 flex w-full flex-row items-start gap-4">
        {!editPreference ? (
          <div className="w-1/2 rounded-lg border-[1px] border-gray-300 px-3 py-2 ">
            <div className="text-xs font-normal leading-4 text-gray-500">Projet professionnel</div>
            <div className="w-full text-sm font-normal leading-5">{data?.professionnalProject ? t(data.professionnalProject) : "Non renseigné"}</div>
          </div>
        ) : (
          <div className="w-1/2 rounded-lg border-[1px] border-gray-300 px-3 py-2 ">
            <div className="text-xs font-normal leading-4 text-gray-500">Projet professionnel</div>
            <div className="relative" ref={refProject}>
              <button className="flex w-full cursor-pointer items-center justify-between disabled:cursor-wait disabled:opacity-50" onClick={() => setOpenProject((e) => !e)}>
                <div className="flex items-center gap-2">
                  {data?.professionnalProject ? (
                    <span className="text-sm font-normal leading-5">{t(data?.professionnalProject)}</span>
                  ) : (
                    <span className="text-sm font-normal text-gray-400">Projet professionnel</span>
                  )}
                </div>
                <ChevronDown className="text-gray-400" />
              </button>
              {/* display options */}
              <div className={`${openProject ? "block" : "hidden"}  absolute left-0 top-[30px] z-50 min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
                {Object.values(PROFESSIONNAL_PROJECT).map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setData({ ...data, professionnalProject: option, professionnalProjectPrecision: "" });
                      setOpenProject(false);
                      setErrorMessage({});
                    }}
                    className={`${option === data?.professionnalProject && "bg-gray font-bold"}`}>
                    <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                      <div>{t(option)}</div>
                      {option === data?.professionnalProject ? <BsCheck2 /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex w-1/2 flex-col ">
          {!editPreference && data?.professionnalProjectPrecision ? (
            <div className="w-full rounded-lg border-[1px] border-gray-300 px-3 py-2 ">
              <div className="text-xs font-normal leading-4 text-gray-500">Précisez</div>
              <div className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent">
                {t(data.professionnalProjectPrecision) ? t(data.professionnalProjectPrecision) : "Non renseigné"}
              </div>
            </div>
          ) : editPreference && data?.professionnalProject === PROFESSIONNAL_PROJECT.OTHER ? (
            <div className="w-full rounded-lg border-[1px] border-gray-300 px-3 py-2 ">
              <div className="text-xs font-normal leading-4 text-gray-500">Précisez</div>
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
                type="text"
                value={data.professionnalProjectPrecision}
                onChange={(e) => setData({ ...data, professionnalProjectPrecision: e.target.value })}
              />
            </div>
          ) : editPreference && data?.professionnalProject === PROFESSIONNAL_PROJECT.UNIFORM ? (
            <div className="w-full rounded-lg border-[1px] border-gray-300 px-3 py-2 ">
              <div className="text-xs font-normal leading-4 text-gray-500">Précisez</div>
              <div className="relative" ref={refProjectPrecision}>
                <button
                  className="flex w-full cursor-pointer items-center justify-between disabled:cursor-wait disabled:opacity-50"
                  onClick={() => setOpenProjectPrecision((e) => !e)}>
                  <div className="flex items-center gap-2">
                    {data?.professionnalProjectPrecision ? (
                      <span className="text-sm font-normal leading-5">{t(data?.professionnalProjectPrecision)}</span>
                    ) : (
                      <span className="text-sm font-normal text-gray-400">Projet professionnel</span>
                    )}
                  </div>
                  <ChevronDown className="text-gray-400" />
                </button>
                {/* display options */}
                <div className={`${openProjectPrecision ? "block" : "hidden"}  absolute left-0 top-[30px] z-50 min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
                  {Object.values(PROFESSIONNAL_PROJECT_PRECISION).map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setData({ ...data, professionnalProjectPrecision: option });
                        setOpenProjectPrecision(false);
                        setErrorMessage({});
                      }}
                      className={`${option === data?.professionnalProjectPrecision && "bg-gray font-bold"}`}>
                      <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                        <div>{t(option)}</div>
                        {option === data?.professionnalProjectPrecision ? <BsCheck2 /> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {editPreference && errorMessage.errorProject && <div className="mt-1 text-xs text-red-500">{errorMessage.errorProject}</div>}
        </div>
      </div>
      <div className="mt-4 flex w-full flex-row items-center gap-4">
        <div className="flex w-1/2 items-center gap-10">
          <div className="mr-2 flex items-center">
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
              className={`flex h-4 w-9 items-center rounded-full bg-blue-600 transition duration-100 ease-in ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <div className="shadow-nina flex h-5 w-5 translate-x-[16px] items-center justify-center rounded-full border-[1px] border-gray-200 bg-[#ffffff] transition duration-100 ease-in"></div>
            </div>
          ) : (
            <div
              onClick={() => editPreference && setOpenDesiredLocation(true)}
              name="visibility"
              className={`flex h-4 w-9 items-center rounded-full bg-gray-200 transition duration-100 ease-in ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <div className="shadow-nina flex h-5 w-5 translate-x-0 items-center justify-center rounded-full border-[1px] border-gray-200 bg-[#ffffff] transition duration-100 ease-in"></div>
            </div>
          )}
        </div>
        <div className="flex w-1/2 items-center gap-10">
          <div className="mr-2 flex items-center">
            <div className="font-bold">Bénévole en parallèle ?</div>
          </div>
          {data.engaged === "true" ? (
            <div
              onClick={() => editPreference && setData({ ...data, engaged: "false" })}
              name="visibility"
              className={`flex h-4 w-9 items-center rounded-full bg-blue-600 transition duration-100 ease-in ${!editPreference ? "cursor-not-allowed" : "cursor-pointer"}`}>
              <div className="shadow-nina flex h-5 w-5 translate-x-[16px] items-center justify-center rounded-full border-[1px] border-gray-200 bg-[#ffffff] transition duration-100 ease-in"></div>
            </div>
          ) : (
            <div
              onClick={() => editPreference && setData({ ...data, engaged: "true" })}
              name="visibility"
              className={`flex h-4 w-9 cursor-pointer items-center rounded-full bg-gray-200 transition duration-100 ease-in ${
                !editPreference ? "cursor-not-allowed" : "cursor-pointer"
              }`}>
              <div className="shadow-nina flex h-5 w-5 translate-x-0 items-center justify-center rounded-full border-[1px] border-gray-200 bg-[#ffffff] transition duration-100 ease-in"></div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex w-full flex-row items-start gap-4">
        <div className="w-1/2">
          {openDesiredLocation || data.desiredLocation ? (
            <div className="w-full rounded-lg border-[1px] border-gray-300 px-3 py-2 ">
              <div className="text-xs font-normal leading-4 text-gray-500">Endroit où je souhaite effectuer ma mission</div>
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
                type="text"
                placeholder={data?.desiredLocation ? "" : "Non renseigné"}
                disabled={!editPreference}
                value={data.desiredLocation}
                onChange={(e) => setData({ ...data, desiredLocation: e.target.value })}
              />
            </div>
          ) : null}
          {openDesiredLocation && errorMessage.desiredLocation && <div className="mt-1 text-xs text-red-500">{errorMessage.desiredLocation}</div>}
        </div>
        <div className="w-1/2">
          {data.engaged === "true" ? (
            <div className="w-full rounded-lg border-[1px] border-gray-300 px-3 py-2 ">
              <div className="text-xs font-normal leading-4 text-gray-500">Description de l’activité</div>
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
                type="text"
                placeholder={data?.engagedDescription ? "" : "Non renseigné"}
                disabled={!editPreference}
                value={data.engagedDescription}
                onChange={(e) => setData({ ...data, engagedDescription: e.target.value })}
              />
            </div>
          ) : null}
          {data.engaged === "true" && errorMessage.engaged && <div className="mt-1 text-xs text-red-500">{errorMessage.engaged}</div>}
        </div>
      </div>
      <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 border-t-[1px] border-b-[1px] py-14">
        <div className="text-sm font-bold leading-5">Domaines favoris</div>
        {!editPreference ? (
          data.domains.length > 0 ? (
            <div className="mt-3 flex flex-row items-start justify-start gap-4">
              {data.domains.map((domain, index) => {
                return (
                  <div key={index} className="flex w-20 flex-col items-center space-y-2">
                    <IconDomainRounded bgStyle="bg-[#212B44]" domain={domain} />
                    <div className="text-center text-xs text-gray-700">{t(domain)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-xs text-gray-700">Aucun domaine renseigné</div>
          )
        ) : (
          <div className="mt-3 flex flex-row items-start justify-start gap-4">
            {Object.values(MISSION_DOMAINS).map((domain, index) => {
              return (
                <div
                  key={index}
                  className="group flex w-20 cursor-pointer flex-col items-center space-y-2"
                  onClick={() => {
                    let result = data.domains;
                    if (result.length >= 3) result.splice(0, 1);
                    result.push(domain);
                    setData({ ...data, domains: result });
                  }}>
                  <div className="transition duration-200 ease-in group-hover:-translate-y-1">
                    <IconDomainRounded domain={domain} bgStyle={data.domains.includes(domain) ? "bg-[#212B44]" : "bg-gray-200"} />
                  </div>
                  <div className="text-center text-xs text-gray-700">{t(domain)}</div>
                </div>
              );
            })}
          </div>
        )}
        {editPreference && errorMessage.domains && <div className="mt-1 text-xs text-red-500">{errorMessage.domains}</div>}
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-4 border-b-[1px] py-14">
        <div className="text-sm font-bold leading-5">Format préféré</div>
        <div className="mt-2 flex space-x-4">
          <div
            className={`py-1 text-sm ${data.missionFormat === "CONTINUOUS" ? "border-b-2 border-blue-600 font-bold text-gray-700" : "font-medium text-gray-400 "} ${
              editPreference ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            onClick={() => editPreference && setData({ ...data, missionFormat: "CONTINUOUS" })}>
            Regroupée sur des journées
          </div>
          <div
            className={`py-1 text-sm ${data.missionFormat === "DISCONTINUOUS" ? "border-b-2 border-blue-600 font-bold text-gray-700" : "font-medium text-gray-400 "} ${
              editPreference ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            onClick={() => editPreference && setData({ ...data, missionFormat: "DISCONTINUOUS" })}>
            Répartie sur des heures
          </div>
        </div>
        <hr className="my-4 w-1/5" />
        <div className="text-sm font-bold leading-5">Période de réalisation de la mission</div>
        <div className="mt-2 flex space-x-4">
          {Object.values(PERIOD).map((period, index) => {
            const Icon = getIconPeriod(period);
            return (
              <div key={index} className={`group flex flex-col items-center justify-start space-y-2 py-1 ${editPreference ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <div
                  className={`flex items-center gap-2 text-sm ${data.period === period ? "border-b-2 border-blue-600 font-bold text-gray-700" : "font-medium text-gray-400 "} `}
                  onClick={() => editPreference && setData({ ...data, period: period })}>
                  {t(period)}
                  {Icon ? <Icon className={data.period === period ? "text-gray-700" : "text-gray-400"} /> : null}
                </div>
              </div>
            );
          })}
        </div>
        {[PERIOD.DURING_HOLIDAYS, PERIOD.DURING_SCHOOL].includes(data.period) ? (
          <div className="mt-2 flex items-center">
            <RankingPeriod handleChange={setData} period={data.period} values={data} name="periodRanking" disabled={!editPreference} />
          </div>
        ) : null}
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-4 pt-14">
        <div className="text-sm font-bold leading-5">Moyen(s) de transport privilégié(s)</div>
        <div className="mt-3 flex flex-row items-start justify-start gap-4">
          {Object.values(TRANSPORT).map((transport, index) => {
            return (
              <div
                key={index}
                className={`rounded-full border-[1px] px-4 py-1 text-xs font-medium ${
                  data.mobilityTransport.includes(transport) ? "border-blue-600 text-blue-600" : "border-gray-400 text-gray-400"
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
          <div className="mt-2 w-1/3 rounded-lg border-[1px] border-gray-300 px-3 py-2">
            <div className="text-xs font-normal leading-4 text-gray-500">Précisez</div>
            <input
              className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
              type="text"
              placeholder={data?.mobilityTransportOther ? "" : "Non renseigné"}
              disabled={!editPreference}
              value={data?.mobilityTransportOther}
              onChange={(e) => setData({ ...data, mobilityTransportOther: e.target.value })}
            />
          </div>
        ) : null}
      </div>
      <div className="flex justify-center">
        {editPreference && errorMessage.transport && <div className="mt-1 flex w-1/3 justify-start text-xs text-red-500">{errorMessage.transport}</div>}
      </div>
    </div>
  );
}
