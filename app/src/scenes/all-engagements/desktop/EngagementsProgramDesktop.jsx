import React, { useEffect, useState } from "react";
import API from "../../../services/api";

import Loader from "../../../components/Loader";
import { capture } from "../../../sentry";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
const images = import.meta.globEager("../../../assets/programmes-engagement/*");

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
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[60%] bg-white px-[102px] py-[60px]">
          <h1 className="mb-4 text-[22px] font-bold">Toutes les formes d&apos;engagement</h1>
          <div className="flex flex-wrap justify-between overflow-x-auto">
            {program.map((item) => {
              const clickId = item._id;
              return (
                <div key={item._id} className="mb-4 w-[48%]">
                  <div className="h-[195px] w-full cursor-pointer">
                    <a href={item.url} target="_blank" rel="noreferrer"></a>
                    <img src={images[`../../../assets/programmes-engagement/${item.imageString}`]?.default} className="h-full w-full object-cover" />
                  </div>

                  <div className={`min-h-min border border-[#E5E5E5] pl-4 pr-1 pb-2 ${!isOpen[clickId] && "h-[250px]"}`}>
                    <div className="my-4 min-h-[40px] pr-14 font-semibold text-[#161616]">{item.name}</div>
                    <div className={`mb-4 pr-14 text-[13px] leading-6 text-[#3A3A3A] ${!isOpen[clickId] && "h-[70px] overflow-hidden text-ellipsis"}`}>
                      <a href={item.url} target="_blank" rel="noreferrer" className="visited:text-[#161616 hover:text-[#161616]">
                        {item.description}
                      </a>
                    </div>
                    <div
                      className="flex justify-between pr-2 text-[13px]"
                      onClick={() => {
                        setIsOpen({ ...isOpen, [clickId]: !isOpen[clickId] });
                      }}>
                      {" "}
                      <div className="cursor-pointer text-[#666666]">{isOpen[clickId] ? "Lire moins" : "Lire plus"}</div>
                      <img src={arrowRightBlue} className="w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <hr className="my-5" />
          <div className="flex justify-end space-x-4">
            <button
              className="flex cursor-pointer items-center justify-center border-[1px] bg-[#000091] py-2 px-4 text-white hover:border-[#000091] hover:bg-white hover:!text-[#000091]"
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
