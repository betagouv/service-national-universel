/**
 * /young-edition
 *
 * ROUTES
 *   POST    /note/:youngId/          -> create new note for a young
 *   PUT     /note/:youngId/:noteId   -> update note
 *   DELETE  /note/:youngId/:noteId   -> delete note
 */

import express, { Response } from "express";
import Joi from "joi";
import passport from "passport";
import { YoungModel } from "../../models";
import { capture } from "../../sentry";
import { serializeYoung } from "../../utils/serializer";
import { ERRORS } from "../../utils";
import { UserRequest } from "../request";
import { validateId } from "../../utils/validator";

const router = express.Router({ mergeParams: true });

router.post("/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: error_id, value: id } = validateId(req.params.youngId);
    if (error_id) {
      capture(error_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const bodySchema = Joi.object().keys({
      note: Joi.string().trim(),
      phase: Joi.string().valid("INSCRIPTION", "PHASE_1", "PHASE_2", "PHASE_3").required().allow(""),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const {
      error,
      value: { note, phase },
    } = result;
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const date = new Date();
    const newNote = {
      note,
      phase,
      createdAt: date,
      updatedAt: date,
      referent: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      },
    };

    const notes = young.notes ? [...young.notes, newNote] : [newNote];

    young.set({
      notes,
      hasNotes: "true",
    });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:youngId/:noteId", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: error_young_id, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    const { error: error_note_id, value: noteId } = Joi.string().required().validate(req.params.noteId, { stripUnknown: true });
    if (error_young_id) {
      capture(error_young_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (error_note_id) {
      capture(error_note_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const bodySchema = Joi.object().keys({
      note: Joi.string().trim(),
      phase: Joi.string().valid("INSCRIPTION", "PHASE_1", "PHASE_2", "PHASE_3").required().allow(""),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const {
      error,
      value: { note, phase },
    } = result;
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(youngId);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const updatedNote = young.notes?.find((note) => note._id?.toString() === noteId);
    if (!updatedNote) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (updatedNote.referent?._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const updatedNotes = young.notes.map((currentNote) => {
      if (currentNote._id?.toString() === noteId) {
        return { _id: currentNote._id, note, phase, updatedAt: new Date(), createdAt: currentNote.createdAt, referent: currentNote.referent };
      }
      return currentNote;
    });

    young.set({ notes: updatedNotes });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:youngId/:noteId", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: error_young_id, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    const { error: error_note_id, value: noteId } = Joi.string().required().validate(req.params.noteId, { stripUnknown: true });
    if (error_young_id) {
      capture(error_young_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (error_note_id) {
      capture(error_note_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(youngId);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const deletedNote = young.notes?.find((note) => note._id?.toString() === noteId);
    if (!deletedNote) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (deletedNote.referent?._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const updatedNotes = young.notes.filter((currentNote) => !(currentNote._id?.toString() === noteId));

    young.set({
      notes: updatedNotes,
      hasNotes: updatedNotes.length > 0 ? "true" : "false",
    });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
