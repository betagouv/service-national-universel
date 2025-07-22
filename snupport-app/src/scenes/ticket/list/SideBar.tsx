import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import CarImage from "../../../assets/car.svg";
import MailImage from "../../../assets/mailIcon.svg";
import MailBoxImage from "../../../assets/mailBoxIcon.svg";
import WrenchImage from "../../../assets/wrenchIcon.svg";
import ChevronImage from "../../../assets/chevron.svg";
import ChevronLeftImage from "../../../assets/chevronLeft.svg";
import ChevronSnuImage from "../../../assets/chevronSnu.svg";
import ChevronLeftSnuImage from "../../../assets/chevronLeftSnu.svg";
import BasicFolderImage from "../../../assets/basicFolder.svg";

import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";

import API from "../../../services/api";
import { STATUS } from "../../../constants";

type Folder = {
  _id: string;
  name: string;
  isMandatoryReferent: boolean;
  folderIndex: number;
  abbreviation?: string;
};

export default function SideBar({ aggregations, filter, update }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(ChevronImage);
  const [imageSrc2, setImageSrc2] = useState(ChevronLeftImage);

  const updateImage = (isOpen, mouseOver) => {
    setImageSrc(mouseOver && !isOpen ? ChevronSnuImage : ChevronImage);
    setImageSrc2(mouseOver && isOpen ? ChevronLeftSnuImage : ChevronLeftImage);
  };

  const handleMouseOver = () => {
    updateImage(isOpen, true);
  };

  const handleMouseLeave = () => {
    updateImage(isOpen, false);
  };

  const { user } = useSelector((state: { Auth: { user: any } }) => state.Auth);
  const nonFolders = [
    {
      id: "mail-tooltip",
      name: "Boîte de réception",
      image: MailImage,
      agentId: "",
      folderId: "",
    },
    {
      id: "mailBox-tooltip",
      name: user.role === "AGENT" ? "Mes tickets assignés" : "Mes nouveaux messages",
      image: MailBoxImage,
      agentId: user._id,
      folderId: "",
    },
  ];

  useEffect(() => {
    getFolder();
  }, []);

  async function getFolder() {
    try {
      const { ok, data } = await API.get({ path: "/folder" });
      if (ok) setFolders(data.sort((a, b) => (a.folderIndex > b.folderIndex ? 1 : -1)));
    } catch (e) {
      toast.error("Erreur lors de la récupération des tags");
    }
  }
  const getTotal = (folderId) => (aggregations.foldersId || []).find((item) => item.key === folderId)?.doc_count || 0;

  return (
    <div className={`flex ${!isOpen ? "w-[72px]" : "w-[276px]"} h-full flex-none flex-col gap-[28px] overflow-y-auto bg-white py-7 pr-1 ${isOpen ? "absolute z-50" : ""}`}>
      <div>
        <div className="mb-1 flex items-center justify-center gap-2">
          <span
            className={`flex items-center text-2xl text-gray-400 cursor-pointer hover:text-purple-snu rounded-md hover:bg-[#C7D2FE] mr-2 ml-2 py-4 ${
              isOpen ? "h-[56px] w-full justify-end" : "w-14 justify-center"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            data-tip="Agrandir le menu"
            data-for="chevron-tooltip"
          >
            {isOpen && <span className="w-full text-center text-base font-medium ml-6">Réduire le menu</span>}
            {!isOpen ? <img src={imageSrc} /> : <img src={imageSrc2} className={`mr-2`} />}
          </span>
          {!isOpen && (
            <ReactTooltip
              id="chevron-tooltip"
              type="light"
              place="right"
              effect="solid"
              className="custom-tooltip-radius !opacity-100 !shadow-lg !text-purple-snu !text-xs !font-medium"
            />
          )}
        </div>

        <div className="flex flex-col">
          {user.role === "AGENT" ? (
            <span className={`text-xs font-medium  uppercase text-gray-500 text-center ${isOpen && "text-start ml-4"}`}>TICKETS</span>
          ) : (
            <span className={`text-xs font-medium  uppercase text-gray-500 text-center ${isOpen && "text-start ml-4"}`}>MESSAGES</span>
          )}
          {nonFolders.map((nonFolder, index, array) => {
            const selected = filter.selectedId === nonFolder.id;
            return (
              <div key={nonFolder.id}>
                <CustomTooltipComponent
                  toolTipId={nonFolder.id}
                  dataTipName={nonFolder.name}
                  image={nonFolder.image}
                  isOpen={isOpen}
                  isFolder={false}
                  selected={selected}
                  total={0}
                  onClick={() => {
                    if (!selected)
                      return update({
                        page: 1,
                        status: STATUS.TOTREAT,
                        sources: [],
                        agent: [],
                        contactId: "",
                        sorting: "",
                        ticketId: "",
                        tag: "",
                        contactGroup: [],
                        size: 30,
                        contactDepartment: [],
                        contactCohort: [],
                        selectedId: nonFolder.id,
                        agentId: nonFolder.agentId,
                        folderId: "",
                      });
                    update({ ...filter, selectedId: "", agentId: "" });
                  }}
                />
                {index !== array.length - 1 && <div className={`border-b-2 mt-1 self-center ${isOpen ? "w-[250px]" : "w-14 mr-2"}`}></div>}
              </div>
            );
          })}
          <span className={`text-xs font-medium text-center uppercase text-gray-500 mt-6 mb-2 ${isOpen && "text-start ml-4"}`}>DOSSIERS</span>
          {folders
            .filter((folder) => user.role === "AGENT" || folder.isMandatoryReferent)
            .sort((a, b) => {
              if (a.name === "Assistance technique") return -1;
              if (b.name === "Assistance technique") return 1;
              if (a.name.includes("Permis")) return -1;
              if (b.name.includes("Permis")) return 1;
              return 0;
            })
            .map((folder, index, array) => {
              const selected = filter.selectedId === folder._id;
              //Le folderImage c'est en attendant la modification du foldersModel
              let folderImage;
              if (folder.name.includes("Permis")) folderImage = CarImage;
              else if (folder.name === "Assistance technique") folderImage = WrenchImage;
              else folderImage = BasicFolderImage;
              return (
                <div key={folder._id}>
                  <CustomTooltipComponent
                    toolTipId={folder._id}
                    dataTipName={folder.name}
                    folderAbbreviation={folder?.abbreviation ? folder?.abbreviation : folder.name.slice(0, 2)}
                    image={folderImage}
                    isOpen={isOpen}
                    isFolder={true}
                    selected={selected}
                    total={getTotal(folder._id)}
                    onClick={() => {
                      if (!selected) return update({ ...filter, selectedId: folder._id, folderId: folder._id, agentId: "" });
                      update({ ...filter, selectedId: "", folderId: "" });
                    }}
                  />
                  {index !== array.length - 1 && <div className={`border-b-2 mt-1 ml-3 self-center ${isOpen ? "w-[250px]" : "w-14 mr-2"}`}></div>}{" "}
                </div>
              );
            })}
          {user.role !== "AGENT" && (
            <>
              {folders
                .filter((folder) => !folder.isMandatoryReferent)
                .sort((a, b) => {
                  if (a.name === "Assistance technique") return -1;
                  if (b.name === "Assistance technique") return 1;
                  if (a.name.includes("Permis")) return -1;
                  if (b.name.includes("Permis")) return 1;
                  return 0;
                })
                .map((folder, index, array) => {
                  const selected = filter.folderId === folder._id;
                  //Le folderImage c'est en attendant la modification du foldersModel
                  let folderImage;
                  if (folder.name.includes("Permis")) folderImage = CarImage;
                  else if (folder.name === "Assistance technique") folderImage = WrenchImage;
                  else folderImage = BasicFolderImage;
                  return (
                    <div key={folder._id}>
                      <CustomTooltipComponent
                        toolTipId={folder._id}
                        dataTipName={folder.name}
                        folderAbbreviation={folder?.abbreviation ? folder?.abbreviation : folder.name.slice(0, 2)}
                        image={folderImage}
                        isOpen={isOpen}
                        isFolder={true}
                        selected={selected}
                        total={getTotal(folder._id)}
                        onClick={() => {
                          if (!selected) return update({ ...filter, selectedId: folder._id, folderId: folder._id, agentId: "" });
                          update({ ...filter, selectedId: "", folderId: "" });
                        }}
                      />
                      {index !== array.length - 1 && <div className={`border-b-2 mt-1 ml-3 self-center ${isOpen ? "w-[250px]" : "w-14 mr-2"}`}></div>}
                    </div>
                  );
                })}
            </>
          )}
        </div>
      </div>
      {user.role !== "AGENT" && <ReactTooltip multiline={true} />}
    </div>
  );
}

const CustomTooltipComponent = ({ toolTipId, dataTipName, folderAbbreviation = "", image, isOpen, isFolder, onClick, total, selected }) => {
  return (
    <div className="flex mt-2 items-center justify-center gap-2">
      <span
        className={`flex items-center text-2xl text-gray-400 cursor-pointer rounded-md hover:bg-[#C7D2FE]  ${selected && "bg-[#C7D2FE]"} py-3 mr-2 ml-2 ${
          !isOpen ? "w-14 justify-center" : "w-full justify-start"
        }`}
        data-tip={dataTipName}
        data-for={toolTipId}
        onClick={onClick}
      >
        <div style={{ position: "relative" }}>
          <img src={image} className={`${isOpen && !isFolder && "ml-6"} ${isOpen && isFolder && "ml-5"}`} />
          {dataTipName !== "Assistance technique" && !dataTipName.includes("Permis") && isFolder && (
            <p style={{ position: "absolute", top: "5px", left: isOpen ? "24px" : "4px", zIndex: 1 }} className="text-white text-xs font-bold">
              {folderAbbreviation}
            </p>
          )}
          {total !== 0 && !isOpen && (
            <span
              style={{ position: "absolute", bottom: "16px", left: "20px", zIndex: 1 }}
              className="flex-none rounded-full bg-[#FFDBD9] w-5 mr-1 text-center py-0.5 text-xs font-medium text-[#C93D38]"
            >
              {total}
            </span>
          )}
        </div>
        {isOpen && (
          <span className={`w-full text-start text-base font-medium text-purple-snu ml-6 ${selected ? "font-bold text-accent-color" : "font-medium text-gray-900"}`}>
            {dataTipName}
          </span>
        )}
        {total !== 0 && isOpen && <span className="flex-none rounded-full bg-[#FFDBD9] w-5 mr-1 text-center py-0.5 text-xs font-medium text-[#C93D38]">{total}</span>}
      </span>
      {!isOpen && (
        <ReactTooltip id={toolTipId} type="light" place="right" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-lg !text-purple-snu !text-xs !font-medium" />
      )}
    </div>
  );
};
