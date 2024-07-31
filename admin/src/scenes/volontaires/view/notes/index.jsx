import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Box } from "../../../../components/box";
import YoungHeader from "../../../phase0/components/YoungHeader";
import { PlainButton } from "../../../plan-transport/components/Buttons";
import NoteEditModal from "./components/NoteEditModal";
import { phaseOptions } from "./utils";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import Note from "./components/Note";
import ConfirmationModal from "../../../phase0/components/ConfirmationModal";

const message = {
  CREATE_SUCCESS: "La note a bien été créée",
  UPDATE_SUCCESS: "La note a bien été mise à jour",
  DELETE_SUCCESS: "La note a bien été supprimée",
  CREATE_ERROR: "Une erreur est survenue lors de la creation de la note",
  UPDATE_ERROR: "Une erreur est survenue lors de la mise à jour de la note",
  DELETE_ERROR: "Une erreur est survenue lors de la suppression de la note",
};

const newNote = {
  phase: phaseOptions[0].value,
  note: "",
};

const Notes = ({ young, onChange }) => {
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [deletedNoteId, setDeletedNoteId] = useState();
  const [isDeleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [note, setNote] = useState(newNote);

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    if (note._id) {
      setNoteModalOpen(true);
    }
  }, [note]);

  const toggleNoteModal = () => {
    const newIsOpen = !isNoteModalOpen;
    setNoteModalOpen(newIsOpen);
    if (!newIsOpen) {
      setNote(newNote);
    }
  };

  const openDeleteConfirmModal = (noteId) => () => {
    setDeletedNoteId(noteId);
    setDeleteConfirmModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setDeletedNoteId(undefined);
    setDeleteConfirmModalOpen(false);
  };

  const saveNote = async ({ note, phase, _id }) => {
    try {
      setLoading(true);
      const { ok, code } = _id ? await api.put(`/young/note/${young._id}/${_id}`, { note, phase }) : await api.post(`/young/note/${young._id}`, { note, phase });
      if (!ok) return toastr.error(_id ? message.UPDATE_ERROR : message.CREATE_ERROR, translate(code));
      toastr.success(_id ? message.UPDATE_SUCCESS : message.CREATE_SUCCESS, "");
      onChange();
    } catch (error) {
      console.log({ error });
      toastr.error(_id ? message.UPDATE_ERROR : message.CREATE_ERROR, translate(error.code));
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.remove(`/young/note/${young._id}/${deletedNoteId}`);
      if (!ok) return toastr.error(message.DELETE_ERROR, translate(code));
      toastr.success(message.DELETE_SUCCESS, "");
      onChange();
    } catch (error) {
      console.log({ error });
      toastr.error(message.DELETE_ERROR, translate(error.code));
    } finally {
      setLoading(false);
    }
  };

  const editNote = (note) => () => {
    setNote(note);
  };

  return (
    <>
      <ConfirmationModal title="Êtes-vous sûr(e) de vouloir supprimer la note ?" isOpen={isDeleteConfirmModalOpen} onCancel={closeDeleteConfirmModal} onConfirm={deleteNote} />
      <NoteEditModal
        isOpen={isNoteModalOpen}
        onClose={toggleNoteModal}
        onSave={saveNote}
        isLoading={isLoading}
        note={note}
        updateNote={(key, value) => setNote({ ...note, [key]: value })}
      />
      <YoungHeader young={young} tab="notes" onChange={onChange} />
      <div className="box-border p-8">
        <Box className="p-8">
          {young.notes?.length === 0 ? (
            <div className="flex-column flex items-center justify-center py-[10%]">
              <div className="mb-4 font-bold">Aucune note interne n’a été ajoutée sur ce profil.</div>
              <PlainButton onClick={toggleNoteModal}>Ajouter une note interne</PlainButton>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-between">
                <div>
                  <div className="text-lg font-medium">Notes internes sur le profil</div>
                </div>
                <PlainButton onClick={toggleNoteModal} mode="blue">
                  Ajouter une note interne
                </PlainButton>
              </div>
              {young.notes.map((note) => (
                <Note
                  key={note._id}
                  note={note}
                  isAuthor={note.referent._id === user._id}
                  actions={[
                    { label: "Modifier la note interne", onClick: editNote(note) },
                    { label: "Supprimer la note interne", onClick: openDeleteConfirmModal(note._id) },
                  ]}
                />
              ))}
            </div>
          )}
        </Box>
      </div>
    </>
  );
};

export default Notes;
