import React, { Suspense } from "react";
import api from "@/services/api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface URLParams {
  id: string;
}

// Les identifiants de template Brevo sont numériques (FL4).
const isTemplateId = (id?: string) => !!id && /^\d+$/.test(id);

const fetchEmailPreview = async (id: string) => {
  if (!isTemplateId(id)) throw new Error("Identifiant de template invalide");
  const response = await api.get(`/email-preview/template/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch email preview: " + response.data.code);
  }
  return response.data.html;
};

const EmailPreviewContent = () => {
  const { id } = useParams<URLParams>();
  const { data: htmlContent } = useQuery({
    queryKey: ["emailPreview", id],
    queryFn: () => fetchEmailPreview(id),
  });

  if (!htmlContent) return <div className="text-center my-10">Aucun contenu disponible</div>;

  // Le HTML du template est rendu dans un cadre isolé, sans script ni accès à l'origine de l'admin (FL4).
  return (
    <iframe
      title="Aperçu de l'e-mail"
      srcDoc={htmlContent}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      className="h-screen w-full border-0"
    />
  );
};

export default function EmailPreview() {
  return (
    <Suspense fallback={<div>Chargement</div>}>
      <EmailPreviewContent />
    </Suspense>
  );
}
