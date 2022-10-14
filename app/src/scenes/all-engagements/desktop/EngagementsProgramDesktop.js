import React, { useEffect, useState } from "react";
import API from "../../../services/api";

import Loader from "../../../components/Loader";
import { capture } from "../../../sentry";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import arrowRightBlue from "../../../assets/arrowRightBlue.svg";

const EngagementsProgramMobile = () => {
  const [program, setProgram] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const getProgram = async () => {
      try {
        const { ok, data } = await API.get("/program/public/engagements");
        if (!ok) {
          toastr.error("Oups, une erreur est survenue");
          history.push("/");
          return;
        }
        setProgram(data);
        setIsLoading(false);
      } catch (error) {
        capture(error);
        toastr.error("Oups, une erreur est survenue");
        history.push("/");
      }
    };
    getProgram();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <>
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[60%] mx-auto my-0 px-[102px] py-[60px]">
          <h1 className="text-[22px] font-bold mb-4">Toutes les formes d&apos;engagement</h1>
          <div className="overflow-x-auto flex flex-wrap justify-between">
            {program.map((item) => {
              const clickId = item._id;
              return (
                <div key={item._id} className="mb-4 w-[48%]">
                  <div className="w-full h-[195px] cursor-pointer">
                    <a href={item.url} target="_blank" rel="noreferrer"></a>
                    <img src={require(`../../../assets/programmes-engagement/${item.imageString}`)} className="object-cover w-full h-full" />
                  </div>

                  <div className={`min-h-min pl-4 pr-1 pb-2 border border-[#E5E5E5] ${!isOpen[clickId] && "h-[250px]"}`}>
                    <div className="font-semibold my-4 min-h-[40px] pr-14 text-[#161616]">{item.name}</div>
                    <div className={`text-[13px] text-[#3A3A3A] pr-14 leading-6 mb-4 ${!isOpen[clickId] && "h-[70px] text-ellipsis overflow-hidden"}`}>
                      <a href={item.url} target="_blank" rel="noreferrer" className="visited:text-[#161616 hover:text-[#161616]">
                        {item.description}
                      </a>
                    </div>
                    <div
                      className="text-[13px] flex justify-between pr-2"
                      onClick={() => {
                        setIsOpen({ ...isOpen, [clickId]: !isOpen[clickId] });
                      }}>
                      {" "}
                      <div className="text-[#666666] cursor-pointer">{isOpen[clickId] ? "Lire moins" : "Lire plus"}</div>
                      <img src={arrowRightBlue} className="w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <hr className="my-5 h-px bg-gray-200 border-0" />
          <div className="flex justify-end space-x-4">
            <button
              className="flex items-center justify-center py-2 px-4 hover:!text-[#000091] border-[1px] hover:border-[#000091] hover:bg-white cursor-pointer bg-[#000091] text-white"
              onClick={() => history.push("/")}>
              Revenir à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EngagementsProgramMobile;
