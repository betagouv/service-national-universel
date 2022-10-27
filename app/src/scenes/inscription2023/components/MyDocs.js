import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { formatDateFR, translate, translateCorrectionReason, YOUNG_STATUS } from "snu-lib";
import api from "../../../services/api";
import Error from "../../../components/error";
import Bin from "../../../assets/icons/Bin";
import EditPenLight from "../../../assets/icons/EditPenLight";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import DatePickerList from "../../preinscription/components/DatePickerList";
import Select from "./Select";
import ErrorMessage from "./ErrorMessage";

export default function MyDocs({ young }) {
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const [file, setFile] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const corrections = young?.correctionRequests.filter((e) => e.field === "cniExpirationDate" && ["SENT", "REMINDED"].includes(e.status));

  const options = [
    { label: translate("cniOld"), value: "cniOld" },
    { label: translate("cniNew"), value: "cniNew" },
  ];

  async function deleteFile(fileId) {
    const res = await api.remove(`/young/${young._id}/documents/cniFiles/${fileId}`);
    if (!res.ok) return setError({ text: "Erreur lors de la suppression de votre fichier." });
    let newYoung = { ...young };
    newYoung.files.cniFiles = res.data;
    dispatch(setYoung(newYoung));
  }

  async function editFile(fileId, category, expirationDate) {
    const res = await api.put(`/young/${young._id}/documents/cniFiles/${fileId}`, { category, expirationDate });
    if (!res.ok) return setError({ text: "Erreur lors de l'édition de votre fichier." });
    let newYoung = { ...young };
    newYoung.files.cniFiles = res.data;
    dispatch(setYoung(newYoung));
  }

  if (!young?.files.cniFiles.length > 0) return <></>;
  return (
    <>
      <Modal isOpen={isOpen} centered onHide={() => setIsOpen(false)} toggle={() => setIsOpen(!isOpen)}>
        <ModalHeader closeButton>
          <p className="text-gray-800">Nom du fichier : {file?.name}</p>
        </ModalHeader>
        <ModalBody>
          <Select
            options={options}
            value={file?.category}
            label="Type de document"
            onChange={(value) => setFile({ ...file, category: value })}
            // error={errors.hostRelationship}
          />
          <p className="text-gray-800">Date d&apos;expiration</p>
          <DatePickerList value={new Date(file?.expirationDate)} onChange={(expirationDate) => setFile({ ...file, expirationDate })} />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              editFile(file._id, file.category, file.expirationDate);
              setIsOpen(false);
            }}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
      <div className="w-full">
        <h2 className="text-xl text-gray-800 font-semibold my-4">Mes documents en ligne</h2>
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        {young?.status === YOUNG_STATUS.WAITING_CORRECTION &&
          corrections.map((e) => (
            <ErrorMessage key={e._id}>
              <strong>Date d&apos;expiration incorrecte</strong>
              {e.message && ` : ${e.message}`}
            </ErrorMessage>
          ))}
        {young.files.cniFiles.map((e) => (
          <div key={e._id} className="flex w-full justify-between my-4">
            <div className="w-2/3">
              <p className="text-gray-800 text-sm truncate">{e.name}</p>
              <p className="text-gray-500 text-xs truncate">
                {translate(e.category)} - Expire le {formatDateFR(e.expirationDate)}
              </p>
            </div>
            <div className="text-blue-800 cursor-pointer hover:text-blue-600 flex">
              <div className="mt-1 mr-1">
                <EditPenLight />
              </div>
              <div
                className="text-sm font-medium mr-4"
                onClick={() => {
                  setFile(e);
                  setIsOpen(true);
                }}>
                Modifier
              </div>
            </div>
            <div className="text-red-500 cursor-pointer hover:text-red-400 flex">
              <div className="mt-1 mr-1">
                <Bin fill="red" />
              </div>
              <div className="text-sm font-medium" onClick={() => deleteFile(e._id)}>
                Supprimer
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
