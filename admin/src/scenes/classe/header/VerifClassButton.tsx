import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { HiOutlineCheck } from "react-icons/hi";
import { IoWarningOutline } from "react-icons/io5";

import { ModalConfirmation, Button } from "@snu/ds/admin";
import { ClassesRoutes, HttpError, translateStatusClasse } from "snu-lib";
import { apiv2 } from "@/services/apiv2";
import { ClasseService } from "@/services/classeService";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export default function VerifClassButton({ classe, setClasse, isLoading, setLoading }: Props) {
  const [showModaleErrorOnVerify, setShowModaleErrorOnVerify] = useState(false);

  const checkVerifyClasse = () => {
    interface Errors {
      estimatedSeats?: boolean;
      firstName?: boolean;
      lastName?: boolean;
      email?: boolean;
    }

    const errors: Errors = {};
    if (!classe?.estimatedSeats) errors.estimatedSeats = true;
    if (!classe?.referents?.[0]?.firstName) errors.firstName = true;
    if (!classe?.referents?.[0]?.lastName) errors.lastName = true;
    if (!classe?.referents?.[0]?.email) errors.email = true;

    if (Object.keys(errors).length > 0) {
      setShowModaleErrorOnVerify(true);
      setLoading(false);
      return;
    }
    verifyClasse();
  };

  const verifyClasse = async () => {
    setLoading(true);
    await apiv2
      .post<ClassesRoutes["GetOne"]["response"]["data"]>(`/classe/${classe?._id}/verify`, classe)
      .then((updatedClasse) => {
        console.log("updatedClasse", updatedClasse);
        toastr.success("Opération réussie", "La classe a bien été vérifiée");
        const classeView = ClasseService.mapDtoToView(updatedClasse);
        setClasse(classeView);
      })
      .catch((error: HttpError) => {
        if (error?.statusCode === 422) {
          toastr.error("Oups, une erreur est survenue lors de la vérification de la classe", `${translateStatusClasse(error.message)} - Erreur : ${error.correlationId}`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Button
        key="verify"
        title="Déclarer cette classe vérifiée"
        leftIcon={<HiOutlineCheck size={20} className="mt-1" />}
        className="mr-2"
        onClick={checkVerifyClasse}
        disabled={isLoading}
      />
      <ModalConfirmation
        isOpen={showModaleErrorOnVerify}
        onClose={() => {
          setShowModaleErrorOnVerify(false);
        }}
        className="md:max-w-[700px]"
        icon={<IoWarningOutline className="text-red-600" size={40} />}
        title="Vous ne pouvez pas vérifier cette classe."
        text={
          <div>
            <p className="mb-2">Pour être vérifiée une classe doit avoir :</p>
            <ul className="list-none">
              <li>- Un effectif prévisionnel non nul</li>
              <li>- Un référent de classe valide avec Nom, Prénom et Email</li>
            </ul>
          </div>
        }
        actions={[{ title: "Annuler", isCancel: true }]}
      />
    </>
  );
}
