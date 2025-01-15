import React from "react";
import { toastr } from "react-redux-toastr";
import { useQuery } from "@tanstack/react-query";

import { translate, AlerteMessageDto } from "snu-lib";
import { Page, Header, Container } from "@snu/ds/admin";

import api from "@/services/api";

import InfoMessage from "../components/ui/InfoMessage";

import Accueil_jpg from "@/assets/accueil-cle/accueil.jpg";

export default function Accueil() {
  const { data: messages } = useQuery<AlerteMessageDto[]>({
    queryKey: ["alerte-messages", "user"],
    queryFn: async () => {
      const { ok, code, data: response } = await api.get(`/alerte-message`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
        throw new Error(translate(code));
      }
      return response.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });

  const AnnonceRefClassMarkdown = {
    title: "Guide pratique du suivi des inscriptions des élèves",
    message: `
**Actions groupées :** vous pouvez mener une action élève par élève (ligne par ligne) ou en masse (cocher les élèves concernés et choisir dans le menu "Actions groupées" l'action à mener).

**Onglet par onglet, retrouvez :**

- Général : tous les élèves de votre classe, quelques soient leurs statuts.
- Récolte des consentements : tous les élèves qui ont finalisé leur inscription mais qui n'ont pas encore le consentement des représentants légaux.
- Validation des inscriptions : tous les élèves dont l'inscription et la récolte du consentement sont finalisés mais qui doivent être validés par l'établissement.
- Récolte des droits à l'image : tous les élèves qui n'ont pas encore renseignés leurs droits à l'image (non bloquant pour la validation d'inscriptions).
`,
  };

  return (
    <Page>
      <InfoMessage title={AnnonceRefClassMarkdown.title} message={AnnonceRefClassMarkdown.message} className="mb-6" />
      {messages?.map((msg) => <InfoMessage key={msg._id} title={msg.title} message={msg.content} priority={msg.priority} className="mb-6" />)}
      <Header title="Bienvenue sur votre plateforme SNU !" breadcrumb={[{ title: "Accueil" }]} classNameDivTitle="h-[38px]" />
      <Container>
        <div className="flex">
          <div className="text-xl leading-8 font-normal flex flex-col gap-16">
            <p>Suivez les inscriptions aux Classes et Lycées Engagés de votre établissement et participez à l’engagement de vos élèves.</p>
            <p>
              Vous pourrez consulter les messages d’alerte sur cette page. Si vous avez une question, rendez vous sur la{" "}
              <a
                href="https://support.snu.gouv.fr/base-de-connaissance/les-classes-engagees"
                target="_blank"
                rel="noreferrer"
                className="font-bold hover:underline hover:text-gray-900">
                Base de Connaissances
              </a>
              .
            </p>
          </div>
          <img src={Accueil_jpg} alt="Illustration accueil" className=" ml-4 w-1/2" />
        </div>
      </Container>
    </Page>
  );
}
