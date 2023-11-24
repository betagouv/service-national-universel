import React, { useState, useEffect } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Badge, Label, InputText, ModalConfirmation, Select } from "@snu/ds/admin";
import { HiOutlinePencil } from "react-icons/hi";
import { BsSend, BsTrash3 } from "react-icons/bs";
import { VscCopy } from "react-icons/vsc";
import ClasseIcon from "@/components/drawer/icons/Classe";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { capture } from "@/sentry";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate, STATUS_CLASSE } from "snu-lib";

export default function view() {
  const [classe, setClasse] = useState({});
  const [modalInvite, setModalInvite] = useState(false);
  const { id } = useParams();

  const getClasse = async () => {
    try {
      const { ok, code, data: response } = await api.get(`/cle/classe/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de la classe", translate(code));
      }
      setClasse(response);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de la classe");
    }
  };

  useEffect(() => {
    getClasse();
  }, []);

  console.log(classe);

  return (
    <Page>
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4" title={translate(classe.status)} status="inProgress" />}
        breadcrumb={[{ title: <ClasseIcon className="scale-[65%]" /> }, { title: "Mes classes", to: "/mes-classes" }, { title: "Fiche de la classe" }]}
        actions={[<Button key="invite" leftIcon={<BsSend />} title="Inviter des élèves" onClick={() => setModalInvite(true)} />]}
      />
      <Container title="Informations générales" actions={[<Button key="update" type="change" leftIcon={<HiOutlinePencil size={16} />} title="Modifier" />]}>
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Cohorte" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-3" value="CLE 23-24" disabled />
            <Label title="Numéro d’identification" tooltip="This is a test and need to be replaced." />
            <div className="flex items-center justify-between gap-3 mb-3">
              <InputText className="flex-1" value="75IDF_11/10/2024_" disabled />
              <InputText className="flex-1" placeholder="ABCDE" />
            </div>
            <Label title="Nom de la classe engagée" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-3" value={classe.name} onChange={(e) => setclasse({ ...classe, name: e.target.value })} />
            <Label title="Coloration" tooltip="This is a test and need to be replaced." />
            <Select value={{ value: "Environnement", label: "Environnement" }} options={[{ value: "Environnement", label: "Environnement" }]} />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label title="Nombre d'élèves" tooltip="This is a test and need to be replaced." />
            <InputText className="mb-3" type="number" value={27} />
            <Label title="Situation scolaire" tooltip="This is a test and need to be replaced." />
            <Select className="mb-3" label="Type d'établissement" />
            <Select className="mb-3" label="Filière" />
            <Select className="mb-3" label="Niveau" />
            <div className="flex items-center justify-end mt-6">
              <button type="button" className="flex items-center justify-center text-xs text-red-500 hover:text-red-700">
                <BsTrash3 className="mr-2" />
                Supprimer la classe
              </button>
            </div>
          </div>
        </div>
      </Container>
      <Container
        title="Suivi de la classe"
        actions={[
          <Link key="list-students" to="/mes-eleves">
            <Button type="tertiary" title="Voir les élèves" />
          </Link>,
        ]}>
        <div className="flex items-stretch justify-between">
          <table className="flex-1 shrink-0">
            <tbody>
              <tr>
                <td className="font-bold pr-4">Objectif :</td>
                <td className="px-4 font-bold text-lg text-center">27</td>
                <td className="text-gray-500 text-center">Élèves</td>
              </tr>
              <tr className="mt-8">
                <td className="font-bold pr-4">Total :</td>
                <td className="px-4 font-bold text-lg text-center">0</td>
                <td className="text-gray-500 text-center">0%</td>
              </tr>
            </tbody>
          </table>
          <div className="mx-8 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <table className="flex-1 shrink-0">
            <tbody>
              <tr>
                <td className="font-bold text-lg text-right">0</td>
                <td className="px-4 flex-1">Élves inscrits</td>
                <td className="text-gray-500">(0%)</td>
              </tr>
              <tr>
                <td className="font-bold text-lg text-right">0</td>
                <td className="px-4 flex-1">Élèves en attente de consentement </td>
                <td className="text-gray-500">(0%)</td>
              </tr>
            </tbody>
          </table>
          <div className="mx-8 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <table className="flex-1 shrink-0">
            <tbody>
              <tr>
                <td className="font-bold text-lg text-right">0</td>
                <td className="px-4 flex-1">Élèves en cours d’inscription</td>
                <td className="text-gray-500">(0%)</td>
              </tr>
              <tr>
                <td className="font-bold text-lg text-right">0</td>
                <td className="px-4 flex-1">Places libres</td>
                <td className="text-gray-500">(0%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Container>

      <ModalConfirmation
        isOpen={modalInvite}
        onClose={() => setModalInvite(false)}
        icon={<ProfilePic icon={({ size, className }) => <BsSend size={size} className={className} />} />}
        title="Invitez des élèves à rejoindre votre classe !"
        text={
          <>
            <p>
              Vous pouvez inviter des élèves à rejoindre votre classe en leur partageant ce lien :{" "}
              <a href="https://moncompte.snu.gouv.fr/classe-engagee/075IDF765098" className="text-primary">
                https://moncompte.snu.gouv.fr/classe-engagee/075IDF765098
              </a>
            </p>
          </>
        }
        actions={[{ leftIcon: <VscCopy />, title: "Copier le lien", isCancel: true, onClick: () => console.info("Copier le lien") }]}
      />
    </Page>
  );
}
