import React, { useEffect, useState } from "react";
import YoungHeader from "./components/YoungHeader";
import { PlainButton, RoundButton, BorderButton } from "./components/Buttons";
import Pencil from "../../assets/icons/Pencil";
import ChevronDown from "../../assets/icons/ChevronDown";
import Cni from "../../assets/icons/Cni";
import { CorrectionButton, MiniTitle, MoreButton, DownloadButton } from "./components/commons";
import { FieldsGroup } from "./components/FieldsGroup";
import Field from "./components/Field";
import dayjs from "dayjs";
import { translate, translateGrade } from "snu-lib";
import Tabs from "./components/Tabs";
import Bin from "../../assets/Bin";
import { toastr } from "react-redux-toastr";
import api from "../../services/api";

export default function VolontairePhase0View({ young, onChange }) {
  const [currentCorrectionRequestField, setCurrentCorrectionRequestField] = useState("");
  const [requests, setRequests] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [footerMode, setFooterMode] = useState("NO_REQUEST");

  useEffect(() => {
    console.log("VolontairePhase0View: ", young);
    if (young) {
      setRequests(young.correctionRequests ? young.correctionRequests : []);
    } else {
      setRequests([]);
    }
  }, [young]);

  useEffect(() => {
    if (requests.find((r) => r.status === "PENDING")) {
      setFooterMode("PENDING");
    } else if (requests.find((r) => ["SENT", "REMINDED"].includes(r.status))) {
      setFooterMode("WAITING");
    } else {
      setFooterMode("NO_REQUEST");
    }
  }, [requests]);

  function onStartRequest(fieldName) {
    setCurrentCorrectionRequestField(fieldName);
  }

  function onCorrectionRequestChange(fieldName, value) {
    console.log("cor change: ", fieldName, value);
    if (value === null) {
      // delete request.
      setRequests(
        requests.filter((req) => {
          return req.field !== fieldName;
        }),
      );
      setCurrentCorrectionRequestField("");
    } else {
      // change request
      const reqIdx = requests.findIndex((req) => {
        return req.field === fieldName;
      });
      if (reqIdx >= 0) {
        const reqsBefore = reqIdx > 0 ? requests.slice(0, reqIdx) : [];
        const reqsAfter = reqIdx < requests.length - 1 ? requests.slice(reqIdx + 1) : [];
        setRequests([...reqsBefore, { ...requests[reqIdx], message: value, status: "PENDING" }, ...reqsAfter]);
      } else {
        setRequests([
          ...requests,
          {
            cohort: young.cohort,
            field: fieldName,
            reason: undefined,
            message: value,
            status: "PENDING",
          },
        ]);
      }
    }
  }

  function deletePendingRequests() {
    setRequests(
      requests.filter((req) => {
        return req.status !== "PENDING";
      }),
    );
    setCurrentCorrectionRequestField("");
  }

  async function sendPendingRequests() {
    setProcessing(true);
    const pendingRequests = requests.filter((req) => {
      return req.status === "PENDING";
    });
    if (pendingRequests.length > 0) {
      try {
        await api.post(`/correction-request/${young._id}`, pendingRequests);
        toastr.success("Demandes de corrections envoyées.");
        onChange && onChange();
      } catch (err) {
        console.error(err);
        toastr.error("Erreur !", translate(err.code));
      }
    }
    setProcessing(false);
  }

  function remindRequests() {
    // TODO: remind requests
  }

  function processRegistration(state) {
    // TODO: process registration
    console.log("process registration: ", state);
  }

  return (
    <>
      <YoungHeader young={young} tab="file" onChange={onChange} />
      <div className="p-[30px]">
        <div className="pb-[30px]">
          <h1 className="font-bold text-[30px] text-center mb-[8px]">Veuillez vérifier le dossier</h1>
          <p className="text-[14px] leading-[20px] text-center max-w-[826px] mx-auto">
            Vous pouvez faire une <b>demande de correction</b> si besoin en passant votre curseur sur un champ et en cliquant sur le bouton orange. Si vous le souhaitez, vous
            pouvez également <b>modifier</b> vous-même l’information en cliquant sur &quot;modifier&quot;.
          </p>
        </div>
        {/* <SectionIdentite
          young={young}
          requests={requests}
          onStartRequest={onStartRequest}
          currentRequest={currentCorrectionRequestField}
          onCorrectionRequestChange={onCorrectionRequestChange}
        /> */}
        <SectionParents
          young={young}
          requests={requests}
          onStartRequest={onStartRequest}
          currentRequest={currentCorrectionRequestField}
          onCorrectionRequestChange={onCorrectionRequestChange}
        />
        <SectionConsentements young={young} />
      </div>
      {footerMode === "PENDING" && (
        <FooterPending young={young} requests={requests} onDeletePending={deletePendingRequests} sending={processing} onSendPending={sendPendingRequests} />
      )}
      {footerMode === "WAITING" && <FooterSent requests={requests} reminding={processing} onRemindRequests={remindRequests} />}
      {footerMode === "NO_REQUEST" && <FooterNoRequest processing={processing} onProcess={processRegistration} />}
    </>
  );
}

function FooterPending({ young, requests, sending, onDeletePending, onSendPending }) {
  return (
    <div className="fixed bottom-0 left-[220px] right-0 bg-white shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] flex py-[20px] px-[42px]">
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[#242526] text-[18px] font-medium leading-snug">Le dossier est-il conforme&nbsp;?</span>
          {requests.length > 0 && (
            <>
              <span className="py-[4px] px-[10px] bg-[#F97316] text-[#FFFFFF] text-[12px] ml-[12px] rounded-[100px]">
                {requests.length} {requests.length > 1 ? "corrections demandées" : "correction demandée"}
              </span>
              <button className=" ml-[12px] text-[12px] text-[#F87171] ml-[6px] flex items-center" onClick={onDeletePending}>
                <Bin fill="#F87171" />
                Supprimer {requests.length > 1 ? "les demandes" : "la demande"}
              </button>
            </>
          )}
        </div>
        <p className="text-[14px] leading-[20px] text-[#6B7280]">
          Votre demande sera transmise par mail à {young.firstName} {young.lastName} ({young.email})
        </p>
      </div>
      <div>
        <PlainButton spinner={sending} onClick={onSendPending}>
          Envoyer la demande de correction
        </PlainButton>
      </div>
    </div>
  );
}

function FooterSent({ requests, reminding, onRemindRequests }) {
  let sentDate = null;
  let remindedDate = null;
  for (const req of requests) {
    if (req.status === "SENT") {
      if (sentDate === null || req.sentAt.valueOf() > sentDate.valueOf()) {
        sentDate = req.sentAt;
      }
    } else if (req.status === "REMINDED") {
      if (remindedDate === null || req.remindedAt.valueOf() > remindedDate.valueOf()) {
        remindedDate = req.remindedAt;
      }
    }
  }
  const sentAt = sentDate ? dayjs(sentDate).locale("fr").format("DD/MM/YYYY à HH:mm") : null;
  const remindedAt = remindedDate ? dayjs(remindedDate).locale("fr").format("DD/MM/YYYY à HH:mm") : null;

  return (
    <div className="fixed bottom-0 left-[220px] right-0 bg-white shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] flex py-[20px] px-[42px]">
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[#242526] text-[18px] font-medium leading-snug">Demande de correction envoyée</span>
          <span className="py-[4px] px-[10px] bg-[#F7F7F7] text-[#6B7280] text-[12px] ml-[12px] rounded-[100px] border-[#CECECE] border-[1px]">
            {requests.length} {requests.length > 1 ? "corrections demandées" : "correction demandée"}
          </span>
        </div>
        <p className="text-[14px] leading-[20px] text-[#6B7280]">
          {sentAt && "Envoyée le " + sentAt} {remindedAt && (sentAt ? "/ " : "") + "Relancé(e) le " + remindedAt}
        </p>
      </div>
      <div>
        <BorderButton spinner={reminding} onClick={onRemindRequests}>
          Relancere le/la volontaire
        </BorderButton>
      </div>
    </div>
  );
}

function FooterNoRequest({ processing, onProcess }) {
  return (
    <div className="fixed bottom-0 left-[220px] right-0 bg-white shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] flex py-[20px] px-[42px]">
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[#242526] text-[18px] font-medium leading-snug">Le dossier est-il conforme&nbsp;?</span>
        </div>
        <p className="text-[14px] leading-[20px] text-[#6B7280]">Veuillez actualiser le statut du dossier d’inscription.</p>
      </div>
      <div>
        <PlainButton spinner={processing} onClick={() => onProcess("validated")}>
          Valider
        </PlainButton>
        <PlainButton spinner={processing} onClick={() => onProcess("rejected")}>
          Refuser
        </PlainButton>
        <PlainButton spinner={processing} onClick={() => onProcess("waiting_list")}>
          Placer sur liste complémentaire
        </PlainButton>
      </div>
    </div>
  );
}

function SectionIdentite({ young, onStartRequest, currentRequest, onCorrectionRequestChange, requests }) {
  let cniDay = "";
  let cniMonth = "";
  let cniYear = "";
  let cniUploadUrl = null;
  if (young && young.files && young.files.cniFiles && young.files.cniFiles.length > 0) {
    const lastCniFile = young.files.cniFiles[young.files.cniFiles.length - 1];
    if (lastCniFile.expirationDate) {
      const date = dayjs(lastCniFile.expirationDate).locale("fr");
      cniDay = date.date();
      cniMonth = date.format("MMMM");
      cniYear = date.year();
    }
  }

  let birthDay = "";
  let birthMonth = "";
  let birthYear = "";
  if (young.birthdateAt) {
    const date = dayjs(young.birthdateAt).locale("fr");
    birthDay = date.date();
    birthMonth = date.format("MMMM");
    birthYear = date.year();
  }

  useEffect(async () => {
    const lastCniFile = young.files.cniFiles[young.files.cniFiles.length - 1];
    const result = await api.get("/young/" + young._id + "/documents/cniFiles/" + lastCniFile._id);
    console.log("CNI DOWNLOAD FILE: ", result);
    // cniUploadUrl = CDN_BASE_URL + "/todo/" + lastCniFile.name;
  }, [young]);

  return (
    <Section step="Première étape :" title="Vérifier l'identité" editable>
      <div className="flex-[1_0_50%] pr-[56px]">
        <div className="p-[30px] bg-[#F9FAFB] rounded-[7px] mb-[15px] flex items-center justify-between">
          <div>
            <Cni />
            <MiniTitle>Pièce d&apos;identité</MiniTitle>
          </div>
          <div className="flex items-center">
            <CorrectionButton className="mr-[8px]" />
            <DownloadButton className="mr-[8px]" href={cniUploadUrl} target="_blank" />
            <MoreButton />
          </div>
        </div>

        <FieldsGroup
          name="cniExpirationDate"
          title="Date d’expiration de la pièce d’identité"
          mode="correction"
          onStartRequest={onStartRequest}
          currentRequest={currentRequest}
          correctionRequest={getCorrectionRequest(requests, "cniExpirationDate")}
          onCorrectionRequestChange={onCorrectionRequestChange}>
          <Field name="cni_day" label="Jour" value={cniDay} className="mr-[14px] flex-[1_1_23%]" />
          <Field name="cni_month" label="Mois" value={cniMonth} className="mr-[14px] flex-[1_1_42%]" />
          <Field name="cni_year" label="Année" value={cniYear} className="flex-[1_1_35%]" />
        </FieldsGroup>
        <div className="flex items-center justify-between mt-[8px]">
          <MiniTitle>Attestation sur l&apos;honneur</MiniTitle>
          <div className="py-[3px] px-[10px] border-[#CECECE] border-[1px] bg-[#FFFFFF] rounded-[100px] text-[12px] font-normal">Validée</div>
        </div>
        <div className="mt-[32px]">
          <MiniTitle>Identité et contact</MiniTitle>
          <div className="mb-[16px] flex items-start justify-between">
            <Field
              name="lastName"
              label="Nom"
              value={young.lastName}
              mode="correction"
              className="mr-[8px] flex-[1_1_50%]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "lastName")}
              onCorrectionRequestChange={onCorrectionRequestChange}
            />
            <Field
              name="firstName"
              label="Prénom"
              value={young.firstName}
              mode="correction"
              className="ml-[8px] flex-[1_1_50%]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "firstName")}
              onCorrectionRequestChange={onCorrectionRequestChange}
            />
          </div>
          <Field
            name="gender"
            label="Sexe"
            value={translate(young.gender)}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "gender")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <Field
            name="email"
            label="Email"
            value={young.email}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "email")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <Field
            name="phone"
            label="Téléphone"
            value={young.phone}
            mode="correction"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "phone")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
        </div>
      </div>

      <div className="w-[1px] my[73px] bg-[#E5E7EB]" />

      <div className="flex-[1_0_50%] pl-[56px]">
        <div>
          <FieldsGroup
            name="birthdateAt"
            title="Date et lieu de naissance"
            mode="correction"
            correctionLabel="Date de naissance"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "birthdateAt")}
            onCorrectionRequestChange={onCorrectionRequestChange}>
            <Field name="birth_day" label="Jour" value={birthDay} className="mr-[14px] flex-[1_1_23%]" />
            <Field name="birth_month" label="Mois" value={birthMonth} className="mr-[14px] flex-[1_1_42%]" />
            <Field name="birth_year" label="Année" value={birthYear} className="flex-[1_1_35%]" />
          </FieldsGroup>
          <div className="mb-[16px] flex">
            <Field
              name="birthCity"
              label="Ville de naissance"
              value={young.birthCity}
              mode="correction"
              className="mr-[8px] flex-[1_1_50%]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "birthCity")}
              onCorrectionRequestChange={onCorrectionRequestChange}
            />
            <Field
              name="birthCityZip"
              label="Code postal de naissance"
              value={young.birthCityZip}
              mode="correction"
              className="ml-[8px] flex-[1_1_50%]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, "birthCityZip")}
              onCorrectionRequestChange={onCorrectionRequestChange}
            />
          </div>
          <Field
            name="birthCountry"
            label="Pays de naissance"
            value={young.birthCountry}
            mode="correction"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "birthCountry")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
        </div>
        <div className="mt-[32px]">
          <FieldsGroup
            name="address"
            mode="correction"
            title="Adresse"
            noflex
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "address")}
            onCorrectionRequestChange={onCorrectionRequestChange}>
            <Field name="address" label="Adresse" value={young.address} mode="correction" className="mb-[16px]" />
            <Field name="zip" label="Code postal" value={young.zip} mode="correction" className="mr-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
            <Field name="city" label="Ville" value={young.city} mode="correction" className="ml-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
            <Field name="department" label="Département" value={young.department} mode="correction" className="mr-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
            <Field name="region" label="Région" value={young.region} mode="correction" className="ml-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
          </FieldsGroup>
        </div>
      </div>
    </Section>
  );
}

function SectionParents({ young, onStartRequest, currentRequest, onCorrectionRequestChange, requests }) {
  const [currentParent, setCurrentParent] = useState(1);

  function parentHasRequest(parentId) {
    return (
      requests &&
      requests.findIndex((req) => {
        return req.field.startsWith("parent" + parentId);
      }) >= 0
    );
  }

  const tabs = [
    { label: "Représentant légal 1", value: 1, warning: parentHasRequest(1) },
    { label: "Représentant légal 2", value: 2, warning: parentHasRequest(2) },
  ];

  function onParrentTabChange(tab) {
    setCurrentParent(tab);
    onStartRequest("");
  }

  return (
    <Section step="Seconde étape :" title="Vérifiez la situation et l'accord parental" editable>
      <div className="flex-[1_0_50%] pr-[56px]">
        <div>
          <MiniTitle>Situation</MiniTitle>
          <Field
            name="situation"
            label="Statut"
            value={translate(young.situation)}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "situation")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <Field
            name="schoolCity"
            label="Ville de l'établissement"
            value={young.schoolCity}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "schoolCity")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <Field
            name="schoolName"
            label="Nom de l'établissement"
            value={young.schoolName}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "schoolName")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <Field
            name="grade"
            label="Classe"
            value={translateGrade(young.grade)}
            mode="correction"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "grade")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
        </div>
        <div className="mt-[32px]">
          <MiniTitle>Situations particulières</MiniTitle>
          <div>TODO: situation particulières...</div>
          <Field
            name="specificAmenagmentType"
            label="Nature de l'aménagement spécifique"
            value={young.specificAmenagmentType}
            mode="correction"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, "specificAmenagmentType")}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
        </div>
      </div>

      <div className="w-[1px] my[73px] bg-[#E5E7EB]" />
      <div className="flex-[1_0_50%] pl-[56px]">
        <Tabs tabs={tabs} selected={currentParent} onChange={onParrentTabChange} />
        <div className="mt-[32px]">
          <Field
            name={`parent${currentParent}Status`}
            label="Statut"
            value={young[`parent${currentParent}Status`]}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Status`)}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <div className="mb-[16px] flex">
            <Field
              name={`parent${currentParent}LastName`}
              label="Nom"
              value={young[`parent${currentParent}LastName`]}
              mode="correction"
              className="mr-[8px] flex-[1_1_50%]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, `parent${currentParent}LastName`)}
              onCorrectionRequestChange={onCorrectionRequestChange}
            />
            <Field
              name={`parent${currentParent}FirstName`}
              label="Prénom"
              value={young[`parent${currentParent}FirstName`]}
              mode="correction"
              className="ml-[8px] flex-[1_1_50%]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, `parent${currentParent}FirstName`)}
              onCorrectionRequestChange={onCorrectionRequestChange}
            />
          </div>

          <Field
            name={`parent${currentParent}Email`}
            label="Email"
            value={young[`parent${currentParent}Email`]}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Email`)}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <Field
            name={`parent${currentParent}Phone`}
            label="Téléphone"
            value={young[`parent${currentParent}Phone`]}
            mode="correction"
            className="mb-[16px]"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Phone`)}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          <Field
            name={`parent${currentParent}OwnAddress`}
            label="Adresse différente de celle du volontaire"
            value={translate(young[`parent${currentParent}OwnAddress`])}
            mode="correction"
            onStartRequest={onStartRequest}
            currentRequest={currentRequest}
            correctionRequest={getCorrectionRequest(requests, `parent${currentParent}OwnAddress`)}
            onCorrectionRequestChange={onCorrectionRequestChange}
          />
          {young[`parent${currentParent}OwnAddress`] === "true" && (
            <FieldsGroup
              name={`parent${currentParent}Address`}
              mode="correction"
              title="Adresse"
              noflex
              className="mt-[16px]"
              onStartRequest={onStartRequest}
              currentRequest={currentRequest}
              correctionRequest={getCorrectionRequest(requests, `parent${currentParent}Address`)}
              onCorrectionRequestChange={onCorrectionRequestChange}>
              <Field name="address" label="Adresse" value={young.address} mode="correction" className="mb-[16px]" />
              <Field name="zip" label="Code postal" value={young.zip} mode="correction" className="mr-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
              <Field name="city" label="Ville" value={young.city} mode="correction" className="ml-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
              <Field name="department" label="Département" value={young.department} mode="correction" className="mr-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
              <Field name="region" label="Région" value={young.region} mode="correction" className="ml-[8px] mb-[16px] w-[calc(50%-8px)] inline-block" />
            </FieldsGroup>
          )}
        </div>
      </div>
    </Section>
  );
}

function SectionConsentements({ young }) {
  return (
    <Section title="Consentements" collapsable>
      <div className="flex-[1_0_50%] pr-[56px]"></div>

      <div className="w-[1px] my[73px] bg-[#E5E7EB]" />
      <div className="flex-[1_0_50%] pl-[56px]"></div>
    </Section>
  );
}

function Section({ step, title, editable, collapsable, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px]">
      <h2 className="text-center py-[28px] text-[18px] leading-snug font-medium border-[1px] border-[#E5E7EB]">
        {step && <span className="text-[#6B7280]">{step} </span>}
        <span className="text-[#242526]">{title}</span>
      </h2>
      {editable && (
        <RoundButton className="absolute top-[24px] right-[24px]">
          <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
          Modifier
        </RoundButton>
      )}
      {collapsable && (
        <div
          className="flex items-center justify-center h-[40px] w-[40px] absolute top-[24px] right-[24px] text-[#9CA3AF] cursor-pointer hover:text-[#242526]"
          onClick={() => setCollapsed(!collapsed)}>
          <ChevronDown className={collapsed ? "" : "rotate-180"} />
        </div>
      )}
      <div className={`p-[32px] flex ${collapsed ? "hidden" : "block"}`}>{children}</div>
    </div>
  );
}

function getCorrectionRequest(requests, field) {
  return requests.find((req) => {
    return req.field === field;
  });
}
