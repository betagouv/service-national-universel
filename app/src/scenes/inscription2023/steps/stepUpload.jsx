import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import dayjs from "dayjs";

import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import { getCorrectionsForStepUpload } from "../../../utils/navigation";
import { ID } from "../utils";
import { supportURL } from "@/config";

import Help from "../components/Help";
import Navbar from "../components/Navbar";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import StepUploadMobile from "../components/StepUploadMobile";
import useDevice from "@/hooks/useDevice";
import StepUploadDesktop from "../components/StepUploadDesktop";

export default function StepUpload() {
  const device = useDevice();
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (!category) category = young.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();
  const corrections = getCorrectionsForStepUpload(young);
  const supportLink = `${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`;

  const [recto, setRecto] = useState();
  const [verso, setVerso] = useState();
  const [date, setDate] = useState(young.latestCNIFileExpirationDate ? new Date(young.latestCNIFileExpirationDate) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const expirationDate = dayjs(date).locale("fr").format("YYYY-MM-DD");
  const [checked, setChecked] = useState({
    "Toutes les informations sont lisibles": false,
    "Le document n'est pas coupé": false,
    "La photo est nette": false,
  });

  async function uploadFiles(resetState) {
    const oversizedFiles = [recto, verso].filter((e) => e && e.size > 5000000).map((e) => e.name);
    if (oversizedFiles.length) {
      setError({ text: `Fichier(s) trop volumineux : ${oversizedFiles.join(", ")}.` });
      resetState();
      return { ok: false };
    }

    if (recto) {
      const res = await api.uploadFiles(`/young/${young._id}/documents/cniFiles`, recto, { category, expirationDate, side: "recto" });
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
        resetState();
        return { ok: false };
      }
    }

    if (verso) {
      const res = await api.uploadFiles(`/young/${young._id}/documents/cniFiles`, verso, { category, expirationDate, side: "verso" });
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
        resetState();
        return { ok: false };
      }
    }

    return { ok: true };
  }

  async function onSubmit(resetState) {
    try {
      setLoading(true);

      const { ok: uploadOk } = await uploadFiles();
      if (!uploadOk) return;

      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date: expirationDate });

      if (!ok) {
        capture(code);
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: code });
        resetState();
        return;
      }

      if (device === "mobile") await plausibleEvent("Phase0/CTA inscription - CI mobile");
      else await plausibleEvent("Phase0/CTA inscription - CI desktop");

      dispatch(setYoung(responseData));
      history.push("/inscription2023/confirm");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
      resetState();
    }
  }

  async function onCorrect(resetState) {
    try {
      setLoading(true);

      const { ok: uploadOk } = await uploadFiles();
      if (!uploadOk) return;

      const data = { latestCNIFileExpirationDate: date, latestCNIFileCategory: category };
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/correction", data);
      if (!ok) {
        capture(code);
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: translate(code) });
        setLoading(false);
        return;
      }

      plausibleEvent("Phase0/CTA demande correction - Corriger ID");
      dispatch(setYoung(responseData));
      history.push("/");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
      resetState();
    }
  }

  return (
    <>
      <Navbar />
      <DSFRContainer title={ID[category].title} supportLink={supportLink}>
        {device === "mobile" ? (
          <StepUploadMobile
            recto={recto}
            setRecto={setRecto}
            verso={verso}
            setVerso={setVerso}
            date={date}
            setDate={setDate}
            error={error}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            corrections={corrections}
            category={category}
            checked={checked}
            setChecked={setChecked}
            onSubmit={onSubmit}
            onCorrect={onCorrect}
          />
        ) : (
          <StepUploadDesktop
            recto={recto}
            setRecto={setRecto}
            verso={verso}
            setVerso={setVerso}
            date={date}
            setDate={setDate}
            error={error}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            corrections={corrections}
            category={category}
            checked={checked}
            setChecked={setChecked}
            onSubmit={onSubmit}
            onCorrect={onCorrect}
          />
        )}
      </DSFRContainer>
      <Help supportLink={supportLink} />
    </>
  );
}
