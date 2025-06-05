import Loader from "@/components/Loader";
import { ClasseService } from "@/services/classeService";
import { Button, Container, Header, Page } from "@snu/ds/admin";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { BsPeopleFill, BsPersonPlusFill } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router-dom";
import { ClassesRoutes, FunctionalException, ROLES, translateInscriptionManuelle } from "snu-lib";
import useClass from "../utils/useClass";
import InscriptionManuelleForm, { FormValues } from "./InscriptionManuelleForm";

interface InscriptionManuelleFormStatus {
  formId: number;
  isSuccess: boolean;
}

export default function InscriptionManuellePage() {
  const { id } = useParams<{ id: string }>();
  // @ts-expect-error property does not exist
  const user = useSelector((state) => state.Auth.user);
  const [forms, setForms] = useState<InscriptionManuelleFormStatus[]>([{ formId: 0, isSuccess: false }]);

  const { data: classe, isLoading: isClasseLoading } = useClass(id);

  const inscriptionMutation = useMutation({
    mutationFn: async ({ payload, formId }: { payload: any; formId: number }) => {
      if (!id) throw new Error("ID de classe manquant");
      return ClasseService.inscrireEleveManuellement(id, payload);
    },
    onSuccess: (_, variables: { payload: ClassesRoutes["InscriptionManuelle"]["payload"]; formId: number }) => {
      toastr.clean();
      setForms((prev) => prev.map((form) => (form.formId === variables.formId ? { ...form, isSuccess: true } : form)));
    },
    onError: (error) => {
      toastr.clean();
      if (error instanceof FunctionalException) {
        toastr.error("Erreur", translateInscriptionManuelle(error.message));
      } else {
        toastr.error("Erreur", "Une erreur est survenue lors de l'inscription");
      }
    },
  });

  const handleSubmit = async (form: FormValues, formId: number) => {
    if (!id) return;

    const payload = {
      prenom: form.firstName,
      nom: form.lastName,
      dateDeNaissance: form.birthDate,
      sexe: form.gender.value,
    };

    inscriptionMutation.mutate({ payload, formId });
  };

  const addNewForm = () => {
    setForms((prev) => [...prev, { formId: prev.length, isSuccess: false }]);
  };

  if (isClasseLoading) return <Loader />;
  if (!classe) return <Container>Impossible d'inscrire un élève dans cette classe.</Container>;

  if (![ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user.role)) {
    return <Container>Vous n'avez pas les droits pour accéder à cette page.</Container>;
  }

  return (
    <Page>
      <div className="2xl:flex-row sm:flex-col relative">
        <Header
          title={"Inscrire un élève manuellement"}
          breadcrumb={[
            { title: "Séjours" },
            {
              title: "Classes",
              to: "/classes",
            },
            {
              title: "Fiche de la classe",
              to: `/classes/${id}`,
            },
            { title: "Inscrire un élève manuellement" },
          ]}
        />
        <div className="2xl:mt-2 2xl:absolute top-0 right-8 py-4 flex gap-2 pl-8 sm:relative sm:-mt-8 sm:-mb-4">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200">
            <HiAcademicCap size={20} className="text-pink-500" />
            <span className="text-gray-500 font-normal text-sm max-w-[300px] truncate">{classe.etablissement?.name}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200">
            <BsPeopleFill size={20} className="text-pink-500" />
            <span className="text-gray-500 font-normal text-sm max-w-[300px] truncate">{classe.name}</span>
          </div>
        </div>
      </div>

      <Container className="mt-6">
        <div className="bg-gray-50 p-8 rounded-lg mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-gray-100 p-2 mb-4">
              <BsPersonPlusFill size={24} className="text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ajouter de nouveaux élèves à la classe</h2>
            <p className="text-lg text-gray-700 mb-1">Renseignez l'identité et la date de naissance de l'élève.</p>
            <p className="text-lg text-gray-700">
              Il sera automatiquement rattaché à la classe <span className="font-semibold">{classe.name}</span>.
            </p>
          </div>
        </div>

        <div className="bg-white p-4">
          {forms.map((form) => (
            <div key={form.formId} className={form.formId > 0 ? "mt-10 pt-10 border-t border-gray-200" : ""}>
              <InscriptionManuelleForm onSubmit={(data) => handleSubmit(data, form.formId)} isSubmitting={inscriptionMutation.isPending} isSuccess={form.isSuccess} />
            </div>
          ))}

          <div className="border-t border-gray-200 mt-12 pt-6 flex justify-center">
            <Button type="wired" onClick={addNewForm} leftIcon={<FiPlus className="mr-2" />} title="Ajouter un élève" disabled={inscriptionMutation.isPending} />
          </div>
        </div>
      </Container>
    </Page>
  );
}
