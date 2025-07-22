import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../../services/api";
import Header from "../components/Header";
import TemplateModal from "./components/TemplateModal";
import TemplateTable from "./components/TemplateTable";
import { filterObjectByKeys } from "../../../utils";

const defaultTemplate = {};

const Template = () => {
  const [template, setTemplate] = useState(undefined);
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const getTemplates = async () => {
    try {
      const { ok, data } = await API.get({ path: "/template" });
      if (ok) {
        setTemplates(data);
      } else {
        toast.error("Erreur lors de la récupération des modèles de tickets");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des modèles de tickets");
    }
  };

  useEffect(() => {
    getTemplates();
  }, []);

  useEffect(() => {
    if (template && !isModalOpen) {
      setModalOpen(true);
    }
  }, [template]);

  useEffect(() => {
    if (!isModalOpen) {
      setTemplate(undefined);
    }
  }, [isModalOpen]);

  const serializeTemplate = (source) => {
    const template = filterObjectByKeys(source, ["name", "description", "message", "subject", "canal"]);
    if (template.tags && template.tags.length > 0) {
      template.tags = template.tags.map((tag) => tag._id);
    }
    if (template.attributedTo) {
      template.attributedTo = template.attributedTo._id;
    }
    return template;
  };

  const onSave = async (template) => {
    setLoading(true);
    const isCreation = !template._id;

    const body = serializeTemplate(template);
    try {
      const { ok } = isCreation ? await API.post({ path: `/template`, body }) : await API.patch({ path: `/template/${template._id}`, body });
      if (ok) {
        toast.success(isCreation ? "Le modèle de ticket a bien été créée" : "Le modèle de ticket a bien été mise à jour");
        await getTemplates();
        setModalOpen(false);
      } else {
        toast.error(isCreation ? "Erreur lors de la création du modèle de ticket" : "Erreur lors de la mise à jour du modèle de ticket");
      }
    } catch (e) {
      toast.error(isCreation ? "Erreur lors de la création du modèle de ticket" : "Erreur lors de la mise à jour du modèle de ticket");
    } finally {
      setLoading(false);
    }
  };

  const onDuplicate = async (template) => {
    const { name, ...rest } = serializeTemplate(template);
    setLoading(true);
    try {
      const { ok } = await API.post({ path: `/template`, body: { ...rest, name: `${name} copie` } });
      if (ok) {
        toast.success("Le modèle de ticket a bien été dupliqué");
        await getTemplates();
        setModalOpen(false);
      } else {
        toast.error("Erreur lors de la duplication du modèle de ticket");
      }
    } catch (e) {
      toast.error("Erreur lors de la duplication du modèle de ticket");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce modèle de ticket ? Cette opération est définitive")) {
      setLoading(true);
      try {
        const { ok } = await API.delete({ path: `/template/${id}` });
        await getTemplates();
        setModalOpen(false);
        if (ok) {
          toast.success("Le modèle de ticket a bien été supprimée");
        } else {
          toast.error("Erreur lors de la suppression du modèle de ticket");
        }
      } catch (e) {
        toast.error("Erreur lors de la suppression du modèle de ticket");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <TemplateModal open={isModalOpen} setOpen={setModalOpen} template={template} setTemplate={setTemplate} onSave={onSave} isLoading={isLoading} />
      <Header
        action={{
          name: "Nouveau",
          onClick: () => {
            setTemplate(defaultTemplate);
          },
        }}
        subTitle="Modèles de tickets"
        title="Tickets"
      />
      <TemplateTable setTemplate={setTemplate} templates={templates} disabled={isLoading} onDelete={onDelete} onDuplicate={onDuplicate} />
    </>
  );
};

export default Template;
