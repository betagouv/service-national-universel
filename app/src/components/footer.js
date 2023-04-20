import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { appURL } from "../config";
import { useSelector } from "react-redux";

export default function Footer() {
  const young = useSelector((state) => state.Auth.young);
  const [from, setFrom] = useState();
  const [showOldFooter, setShowOldFooter] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (history) {
      return history.listen((location) => {
        setFrom(location.pathname);
      });
    }
  }, [history]);

  useEffect(() => {
    if (
      ["preinscription", "auth", "inscription2023", "reinscription", "representants-legaux", "public-engagements", "inscription", "noneligible"].findIndex((route) =>
        location.pathname.includes(route),
      ) === -1
    ) {
      setShowOldFooter(true);
    } else setShowOldFooter(false);
  }, [from]);

  return showOldFooter ? (
    <div className="relative z-[2] ml-0 mt-auto bg-white py-1 text-center text-sm md:!ml-64 md:text-base">
      <div className="container">
        <ul className="my-[10px]">
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://www.snu.gouv.fr/mentions-legales" target="_blank" rel="noreferrer">
              Mentions légales
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://snu.gouv.fr/accessibilite" target="_blank" rel="noreferrer">
              Accessibilité
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://www.snu.gouv.fr/donnees-personnelles" target="_blank" rel="noreferrer">
              Données personnelles et cookies
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer">
              Conditions générales d&apos;utilisation
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <NavLink to={young ? `/besoin-d-aide?from=${from}` : `/public-besoin-d-aide?from=${window.location.pathname}`} className="m-0 text-[#6f7f98] hover:text-black">
              Besoin d&apos;aide
            </NavLink>
          </li>
        </ul>
        <p className="m-0 text-[#6f7f98]">Tous droits réservés - Ministère de l&apos;éducation nationale et de la jeunesse - {new Date().getFullYear()}</p>
        <ul>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://www.gouvernement.fr/" target="_blank" rel="noreferrer">
              gouvernement.fr
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://www.education.gouv.fr/" target="_blank" rel="noreferrer">
              education.gouv.fr
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="http://jeunes.gouv.fr/" target="_blank" rel="noreferrer">
              jeunes.gouv.fr
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://presaje.sga.defense.gouv.fr/" target="_blank" rel="noreferrer">
              majdc.fr
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://www.service-public.fr/" target="_blank" rel="noreferrer">
              service-public.fr
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://www.legifrance.gouv.fr/" target="_blank" rel="noreferrer">
              legifrance.gouv.fr
            </a>
          </li>
          <li className="my-[2px] mx-[5px] inline-block md:my-[5px] md:mx-[10px]">
            <a className="m-0 text-[#6f7f98] hover:text-black" href="https://www.data.gouv.fr/fr/" target="_blank" rel="noreferrer">
              data.gouv.fr
            </a>
          </li>
        </ul>
      </div>
    </div>
  ) : null;
}
