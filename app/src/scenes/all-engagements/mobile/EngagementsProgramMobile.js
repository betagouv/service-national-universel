import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { capture } from "../../../sentry";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import Loader from "../../../components/Loader";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import StickyButton from "../../../components/inscription/stickyButton";

const EngagementsProgramMobile = () => {
  const [program, setProgram] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const getProgram = async () => {
      try {
        const response = await API.get("/program/public/engagements");
        setProgram(response.data);
        setIsLoading(false);
      } catch (error) {
        capture(error);
        toastr.error("Oups, une erreur est survenue");
        history.push("/preinscription/noneligible");
      }
    };
    getProgram();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <>
      <div className="bg-white p-4">
        <h1 className="text-[22px] font-bold mb-4">Toutes les formes d&apos;engagement</h1>
        {program.map((item) => {
          const clickId = item._id;
          return (
            <div key={item._id} className="mb-4">
              <div className="w-full h-[195px]">
                <img src={require(`../../../assets/programmes-engagement/${item.imageString}`)} className="object-cover w-full h-full" />
              </div>

              <div className={`min-h-min pl-4 pr-1 pb-2 border border-[#E5E5E5] ${!isOpen[clickId] && "h-[250px]"}`}>
                <div className="font-semibold my-4 min-h-[40px] pr-14 text-[#161616]">{item.name}</div>
                <div className={`text-[13px] text-[#3A3A3A] pr-14 leading-6 mb-4 ${!isOpen[clickId] && "h-[70px] text-ellipsis overflow-hidden"}`}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                    {item.description}
                  </a>
                </div>
                <div
                  className="text-[13px] flex justify-between pr-2"
                  onClick={() => {
                    setIsOpen({ ...isOpen, [clickId]: !isOpen[clickId] });
                  }}>
                  {" "}
                  <div className="text-[#666666]">{isOpen[clickId] ? "Lire moins" : "Lire plus"}</div>
                  <img src={arrowRightBlue} className="w-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <StickyButton
        text="Revenir à l'accueil"
        onClick={() => {
          history.push("/");
        }}
      />
    </>
  );
};

export default EngagementsProgramMobile;
