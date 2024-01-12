import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { capture } from "../../../sentry";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import Loader from "../../../components/Loader";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import StickyButton from "../../../components/dsfr/ui/buttons/stickyButton";
import Footer from "@/components/dsfr/layout/Footer";
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
      <div className="bg-white p-4">
        <h1 className="mb-4 text-[22px] font-bold">Toutes les formes d&apos;engagement</h1>
        {program.map((item) => {
          const clickId = item._id;
          return (
            <div key={item._id} className="mb-4">
              <div className="h-[195px] w-full">
                <img src={images[`../../../assets/programmes-engagement/${item.imageString}`]?.default} className="h-full w-full object-cover" />
              </div>

              <div className={`min-h-min border border-[#E5E5E5] pl-4 pr-1 pb-2 ${!isOpen[clickId] && "h-[250px]"}`}>
                <div className="my-4 min-h-[40px] pr-14 font-semibold text-[#161616]">{item.name}</div>
                <div className={`mb-4 pr-14 text-[13px] leading-6 text-[#3A3A3A] ${!isOpen[clickId] && "h-[70px] overflow-hidden text-ellipsis"}`}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                    {item.description}
                  </a>
                </div>
                <div
                  className="flex justify-between pr-2 text-[13px]"
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
      <Footer marginBottom="mb-[88px]" />
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
