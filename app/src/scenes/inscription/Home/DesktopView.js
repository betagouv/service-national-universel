import React from "react";
import { appURL, supportURL } from "../../../config";
import { Link } from "react-router-dom";
import StopIcon from "../components/stopIcon";
import TickIcon from "../components/tickIcon";
import conditions from "./conditions";
import informations from "./informations";
import EligibilityModal from "../components/eligibilityModal";
import plausibleEvent from "../../../services/plausible";

export default function DesktopView() {
  return (
    <div>
      <div className="px-14 mt-4">
        <div className="flex justify-around flex-wrap  border-b pb-4 border-[#DFDFDF]">
          {informations.map((val) => {
            return (
              <div key={val.title} className="w-96 text-center mt-2 p-2 pt-5">
                <span className="bg-[#fff] p-3 rounded-md shadow-2xl text-[26px]">{val.icon}</span>
                <h5 className="mt-4 mb-2 text-[#111827]">{val.title}</h5>
                <p className="text-[#6b7280] break-words">{val.text}</p>
              </div>
            );
          })}
        </div>
        {/* Question Secction */}
        <div className="flex justify-evenly flex-wrap py-4">
          <div className="w-full p-3 md:w-2/4">
            <p className="text-[#6b7280]">
              Et cette année, les lycéens de 2de générale, technologique et professionnelle, dont l&apos;inscription est validée, sont de plein droit autorisés à participer au
              séjour de cohésion y compris sur le temps scolaire (février ou juin). Le séjour de cohésion, c&apos;est vivre une{" "}
              <b className="text-[#6b7280]">expérience inédite et faire des rencontres inoubliables</b>.
            </p>
          </div>
          <div className="w-full p-3 md:w-2/4">
            <p className="text-[#6b7280]">
              <strong className="text-black">Et après le séjour ?</strong>
              <br /> Vous recevez votre certificat individuel de participation à la JDC et un accès gratuit à une plateforme d&apos;apprentissage du code de la route.
              <br />
              Qu&apos;attendez-vous pour vous inscrire ?
            </p>
          </div>
        </div>
      </div>
      {/* Title Container */}
      <div className="bg-white shadow	pb-4">
        <div className=" pt-4 mb-4 border-b pb-4 border-[#DFDFDF]">
          <div className="flex justify-around flex-wrap">
            <div className="mt-1 mb-2 uppercase pt-2 pr-2 text-[#32257f] text-[0.9rem]	font-bold	tracking-widest	">Conditions d&apos;inscription</div>
            <EligibilityModal />
          </div>
        </div>

        {/* First Section */}
        <div className="border-b pb-4 border-[#DFDFDF]">
          <div className="w-[93%] m-auto flex justify-start md:justify-around flex-wrap p-2 text-[#32267f] ">
            <div className="flex mt-1 pb-2">
              <svg className="mt-1" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#32267F" fillOpacity=".06" />
                <path
                  d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z"
                  fill="#32267F"
                />
              </svg>
              <p className="pl-3 text-left ">
                J&apos;aurai <strong>15, 16 ou 17 ans</strong> au moment de mon séjour de cohésion
              </p>
            </div>

            <div className="flex mt-1">
              <svg className="mt-1" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#32267F" fillOpacity=".06" />
                <path
                  d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z"
                  fill="#32267F"
                />
              </svg>
              <p className="pl-3 text-left">
                Je suis de <strong>nationalité française</strong>
              </p>
            </div>
          </div>
        </div>
        {/* Info Container */}
        <div>
          <div className="w-9/12 m-auto pt-4 pb-4 grid grid-cols-1 grid-rows-4  gap-x-8 gap-y-4 md:grid-cols-4 text-sm		">
            <div>
              <p className="hidden md:block text-[#32267f] text-[1rem]">
                Vérifiez si vous êtes <strong>éligible au SNU :</strong>
              </p>
            </div>
            <div>
              <p className="hidden md:block text-center text-[#6b7280] text-[1rem]">
                séjour du <strong>13 au 25 février 2022</strong>
              </p>
            </div>
            <div>
              <p className="hidden md:block text-center text-[#6b7280] text-[1rem]">
                séjour du{" "}
                <strong>
                  12 au 24 juin <br />
                  2022
                </strong>
              </p>
            </div>
            <div>
              <p className="hidden md:block text-center text-[#6b7280] text-[1rem]">
                séjour du{" "}
                <strong>
                  3 au 15 juillet <br /> 2022
                </strong>
              </p>
            </div>
            <div className="block md:hidden">
              <p className="text-[#32267f] text-[1rem] md:text-[0.8rem]">
                Vérifiez si vous êtes <strong>éligible au SNU</strong> selon les dates de séjour proposées :
              </p>
            </div>
            {conditions.map((condition, i) => (
              <React.Fragment key={i}>
                <div>
                  <p className="flex justify-center md:justify-start  text-[#32267f] text-[1rem]">
                    <span>
                      {condition.label} <strong>{condition.bold}</strong>
                    </span>
                  </p>
                </div>
                {/*  */}
                <div className="text-center flex justify-between items-center	 md:flex-col ">
                  <p className="block md:hidden text-[0.8rem] uppercase text-[#6b7280]">
                    du <strong>13 au 25 février 2022</strong>
                  </p>
                  {condition.isDate1 ? (
                    <p style={{ color: "red", fontSize: "0.7rem" }}>Inscriptions clôturées</p>
                  ) : (
                    <p>
                      <StopIcon />
                    </p>
                  )}
                </div>
                {/*  */}
                <div className="text-center flex justify-between items-center	 md:flex-col ">
                  <p className="block md:hidden text-[0.8rem] uppercase text-[#6b7280]">
                    du <strong>12 au 24 juin 2022</strong>
                  </p>
                  {condition.isDate2 ? (
                    <p style={{ color: "red", fontSize: "0.7rem" }}>Inscriptions clôturées</p>
                  ) : (
                    <p>
                      <StopIcon />
                    </p>
                  )}
                </div>
                <div className="text-center flex justify-between items-center	 md:flex-col ">
                  <p className="block md:hidden text-[0.8rem] uppercase text-[#6b7280]">
                    du <strong>3 au 15 juillet 2022</strong>
                  </p>
                  {condition.isDate3 ? (
                    <p>
                      <TickIcon />
                    </p>
                  ) : (
                    <p>
                      <StopIcon />
                    </p>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
          {/* Info container Text */}
          <div className="w-9/12  m-auto pt-4">
            <p className="text-sm text-[#32267f]">
              *Les élèves de 2nde dont l&apos;établissement relève du ministère de l’éducation nationale, de la jeunesse et des sports peuvent s’inscrire même si le séjour se
              déroule sur leur temps scolaire. Ils bénéficieront d’une autorisation de participation au séjour de cohésion.
            </p>
          </div>
        </div>
      </div>
      {/* Grid Container */}
      <div className="hidden lg:block ">
        <div className="ml-2 flex justify-between">
          <div className="flex  w-6/12	p-[2rem]">
            <svg className="mt-2" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#32257F" />
              <path d="M21 24h-1v-4h-1l2 4zm-1-8h.01H20zm9 4a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Info */}
            <div className="pl-3 text-[#6a7181] text-sm">
              <p>Pour compléter l&apos;inscription en quelques minutes, il vous faudra :</p>
              <p>
                • Une <b>pièce d&apos;identité</b> (Carte Nationale d&apos;Identité ou Passeport)
                <br />• L&apos;accord de votre ou vos <b>représentants légaux</b>
              </p>
            </div>
          </div>
          {/* Line  */}
          <div className="w-[1px] bg-[#DFDFDF]"></div>

          <div className="flex  w-6/12 p-[2rem]	ml-3">
            <svg className="mt-2" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#32257F" />
              <path
                d="M16.228 17c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M29 20a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <a className="pl-3 pt-2 text-[#32267f] text-sm hover:text-[#32267f]" onClick={() => plausibleEvent("LP - Aide")} href={`${appURL}/public-besoin-d-aide`} target="blank">
              <p>
                <strong>Besoin d&apos;aide ?</strong>
              </p>
              <p>Toutes les réponses à vos questions</p>
            </a>
          </div>
        </div>
      </div>
      {/* Mobile View Question */}
      <div className="block lg:hidden bg-[#32267f] p-[1rem]">
        <div className="flex justify-evenly">
          <a className="text-[#fff]" onClick={() => plausibleEvent("LP - Aide")} href={`${supportURL}/base-de-connaissance/questions-frequentes-1`} target="blank">
            <p>Toutes les réponses à vos questions</p>
          </a>
          <svg className="mt-[7px]" width="6" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M.293 9.707a1 1 0 010-1.414L3.586 5 .293 1.707A1 1 0 011.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              fill="#fff"
            />
          </svg>
        </div>
      </div>
      {/* Mobile View Question */}
    </div>
  );
}
