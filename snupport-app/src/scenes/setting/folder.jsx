import React, { Fragment, useEffect, useState } from "react";
import { arrayMoveImmutable } from "array-move";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { HiLockClosed, HiChevronDown, HiChevronUp } from "react-icons/hi";
import { BiSave, BiSolidPlusCircle } from "react-icons/bi";
import { GoTrash } from "react-icons/go";
import CarImage from "../../assets/car.svg";
import BasicFolderImage from "../../assets/basicFolder.svg";
import WrenchImage from "../../assets/wrenchIcon.svg";

import ReactTooltip from "react-tooltip";

import API from "../../services/api";
import { capture } from "../../sentry";

export default () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    update();
  }, []);

  async function update() {
    const { data } = await API.get({ path: "/folder" });
    setFolders(data);
  }

  const createFolder = async (folder) => {
    try {
      delete folder.tempId;
      if (!folder.abbreviation || folder.abbreviation.trim() === "") {
        folder.abbreviation = folder.name.slice(0, 2);
      }
      const { abbreviation, name } = folder;

      const { ok } = await API.post({ path: "/folder", body: { abbreviation, name } });
      if (ok) {
        toast.success("Le dossier a été créé avec succès");
        await update();
      }
    } catch (e) {
      toast.error("Une erreur est survenue lors de la création du dossier");
      capture(e);
    }
  };

  const addNewFolder = () => {
    const newFolder = {
      tempId: Date.now(),
      name: "",
    };
    setFolders((prevFolders) => [...prevFolders, newFolder]);
  };

  const deleteFolder = async (folder) => {
    try {
      if (folder.tempId) {
        setFolders((prevFolders) => prevFolders.filter((f) => f.tempId !== folder.tempId));
        return;
      }
      if (!folder._id) {
        setFolders((prevFolders) => prevFolders.filter((f) => f !== folder));
        return;
      }
      const { ok } = await API.delete({ path: `/folder/${folder._id}` });
      if (ok) {
        toast.success("Le dossier a été supprimé avec succès");
        await update();
        setSelectedFolder(undefined);
      }
    } catch (e) {
      toast.error("Une erreur est survenue lors de la supression du dossier");
    }
  };

  const updateFolder = async (folder) => {
    try {
      const { ok } = await API.patch({ path: `/folder/${folder._id}`, body: { name: folder.name, abbreviation: folder?.abbreviation } });
      if (ok) {
        toast.success("Le dossier a été modifié avec succès");
        await update();
        setSelectedFolder(undefined);
      }
    } catch (e) {
      toast.error("Une erreur est survenue lors de la modification du dossier");
    }
  };

  const handleNameChange = (index, newName) => {
    setFolders((prevFolders) => {
      const updatedFolders = [...prevFolders];
      updatedFolders[index].name = newName;
      return updatedFolders;
    });
  };

  const handleAbbreviationChange = (index, newAbbreviation) => {
    setFolders((prevFolders) => {
      const updatedFolders = [...prevFolders];
      updatedFolders[index].abbreviation = newAbbreviation;
      return updatedFolders;
    });
  };

  const onSortEnd = async (e) => {
    if (e.newIndex !== -1) {
      let newFolders = arrayMoveImmutable(folders, e.newIndex, e.oldIndex);
      for (let i = 0; i < newFolders.length; i++) {
        newFolders[i].folderIndex = i;
      }
      const ids = newFolders.map(i => i._id)
      const { ok } = await API.post({ path: "/folder/reindex", body: { ids } });
      if (ok) {
        toast.success("Le dossier a été déplacé avec succès");
        await update();
      }
    }
  };

  return (
    <Fragment>
      <div className=" flex  justify-between ">
        <div className=" pl-[22px]">
          {user.role === "AGENT" && <span className="text-sm font-medium uppercase text-gray-500">Tickets</span>}
          {user.role === "AGENT" ? (
            <h4 className="mt-1.5 mb-2 text-3xl font-bold text-black-dark">Gestion des dossiers</h4>
          ) : (
            <h4 className="mt-1.5 mb-2 text-3xl font-bold text-black-dark">Dossiers</h4>
          )}
        </div>
      </div>
      <p className=" mb-7 max-w-screen-md  pl-[22px] text-sm text-gray-500">
        Vous avez la possibilité de créer des dossiers commun à l'ensemble de votre département afin d’organiser votre boîte de réception en fonction des sujets traités.
      </p>

      <ListFolders
        folders={folders}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        addNewFolder={addNewFolder}
        handleNameChange={handleNameChange}
        handleAbbreviationChange={handleAbbreviationChange}
        handleConfirm={(folder) => {
          // Si l'abréviation n'est pas présente ou est vide,
          // générez une abréviation à partir des deux premiers caractères du nom.
          const abbreviation = folder.abbreviation && folder.abbreviation.length > 0 ? folder.abbreviation : folder.name.slice(0, 2);

          if (folder.name) {
            updateFolder({ ...folder, name: folder.name, abbreviation });
            setSelectedFolder(null);
          } else {
            toast.error("Le nom de dossier ne doit pas être vide");
          }
        }}
        createFolder={createFolder}
        user={user}
        handleDelete={(folder) => {
          deleteFolder(folder);
          setSelectedFolder(null);
        }}
        onSortEnd={onSortEnd}
      />
    </Fragment>
  );
};

const ListFolders = ({ folders, user, handleDelete, addNewFolder, handleNameChange, handleAbbreviationChange, handleConfirm, createFolder, onSortEnd }) => {
  return (
    <div>
      <div className="mb-6 rounded-lg bg-white shadow">
        <div className="flex flex-col justify-between">
          {folders
            .sort((a, b) => {
              if (a.name === "Assistance technique") return -1;
              if (b.name === "Assistance technique") return 1;
              if (a.name.includes("Permis")) return -1;
              if (b.name.includes("Permis")) return 1;
              return 0;
            })
            .map((folder, index) => (
              <div className="flex rounded-lg bg-white first:mt-6" key={index}>
                <div className="flex-1 px-6 py-4">
                  {folder.name.includes("Permis") || folder.name === "Assistance technique" ? (
                    <div className="flex items-center">
                      <img src={folder.name.includes("Permis") ? CarImage : WrenchImage} className="mr-6" />
                      <p className="text-[#32257F]">{folder.name}</p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div style={{ position: "relative" }}>
                        <img src={BasicFolderImage} className="mr-4" />
                        <p style={{ position: "absolute", top: "5px", left: "4px", zIndex: 1 }} className="text-white text-xs font-bold">
                          {folder?.abbreviation ? folder?.abbreviation : folder.name.slice(0, 2)}
                        </p>
                      </div>

                      <input
                        type="text"
                        maxLength="2"
                        value={folder.abbreviation !== undefined ? folder.abbreviation : folder.name.slice(0, 2)}
                        onChange={(e) => handleAbbreviationChange(index, e.target.value)}
                        readOnly={user.role !== "AGENT" && folder.isMandatoryReferent}
                        className="w-[46px] mr-4 rounded border border-gray-300 bg-white text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                        placeholder="Nom de l'étiquette"
                      />
                      <input
                        type="text"
                        value={folder.name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        readOnly={user.role !== "AGENT" && folder.isMandatoryReferent}
                        className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
                        placeholder="Nom de l'étiquette"
                      />
                    </div>
                  )}
                </div>
                <div className="flex w-[160px] flex-none items-center gap-4 py-4">
                  {!folder.name.includes("Permis") && folder.name !== "Assistance technique" && (
                    <>
                      {(user.role === "AGENT" || !folder.isMandatoryReferent) && (
                        <>
                          <button
                            type="button"
                            data-tip="Enregistrer"
                            data-for="bisave-tooltip"
                            onClick={() => (folder.tempId ? createFolder(folder) : handleConfirm({ ...folder, name: folder.name, abbreviation: folder?.abbreviation }))}
                          >
                            <BiSave className=" text-2xl text-accent-color transform hover:scale-110 hover:text-indigo-500 transition-transform" />
                            <ReactTooltip
                              id="bisave-tooltip"
                              type="light"
                              place="top"
                              effect="float"
                              className="custom-tooltip-radius !shadow-sm !text-purple-snu !text-xs !font-medium"
                            />{" "}
                          </button>
                          <p className="text-gray-300">|</p>
                          <button type="button" data-tip="Supprimer" data-for="gotrash-tooltip" onClick={() => handleDelete(folder)}>
                            <GoTrash className="mr-1 text-xl text-red-500 transform hover:scale-110 hover:text-red-600 transition-transform" />
                            <ReactTooltip
                              id="gotrash-tooltip"
                              type="light"
                              place="top"
                              effect="float"
                              className="custom-tooltip-radius !shadow-sm !text-purple-snu !text-xs !font-medium"
                            />{" "}
                          </button>
                          <p className="text-gray-300">|</p>
                          <div>
                            <div>
                              <HiChevronUp
                                className="text-lg cursor-pointer"
                                onClick={(e) => {
                                  onSortEnd({ oldIndex: index, newIndex: index - 1 });
                                  e.stopPropagation();
                                }}
                              />
                            </div>
                            <div>
                              <HiChevronDown
                                className="text-lg cursor-pointer"
                                onClick={(e) => {
                                  onSortEnd({ oldIndex: index, newIndex: index + 1 });
                                  e.stopPropagation();
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {user.role !== "AGENT" && folder.isMandatoryReferent && (
                        <>
                          <div data-tip="Bloqués - Messages classés automatiquement par thématiques.">
                            <HiLockClosed className="text-gray-400" />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                {user.role !== "AGENT" && <ReactTooltip multiline={true} />}
              </div>
            ))}
        </div>
        <button onClick={addNewFolder} type="button" className="flex items-center h-[56px] ml-6 text-gray-500 text-sm font-medium">
          <BiSolidPlusCircle className="text-gray-300 text-xl mr-2" />
          Ajouter un nouveau dossier
        </button>
      </div>
    </div>
  );
};
