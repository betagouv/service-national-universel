import React, { Suspense } from "react";
import api from "@/services/api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface URLParams {
  id: string;
}

const fetchEmailPreview = async (id: string) => {
  const response = await api.get(`/email-preview/template/${id}`);
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

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default function EmailPreview() {
  return (
    <Suspense fallback={<div>Chargement</div>}>
      <EmailPreviewContent />
    </Suspense>
  );
}
