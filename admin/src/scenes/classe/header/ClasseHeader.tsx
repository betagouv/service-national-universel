import React from "react";
import { useSelector } from "react-redux";

import { Header, Badge } from "@snu/ds/admin";
import { translateStatusClasse, ClassesRoutes } from "snu-lib";
import { TStatus } from "@/types";
import { AuthState } from "@/redux/auth/reducer";
import { appURL } from "@/config";

import { getHeaderActionList } from "./index";
import NavbarClasse from "../components/NavbarClasse";
import { statusClassForBadge } from "../utils";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: ClassesRoutes["GetOne"]["response"]["data"]) => void;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  studentStatus: { [key: string]: number };
  page: string;
}

export default function ClasseHeader({ classe, setClasse, isLoading, setIsLoading, studentStatus, page }: Props) {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const url = `${appURL}/je-rejoins-ma-classe-engagee?id=${classe._id.toString()}`;
  const id = classe._id;
  return (
    <>
      <Header
        title={classe.name || "Informations nécessaires"}
        titleComponent={<Badge className="mx-4 mt-2" title={translateStatusClasse(classe.status)} status={statusClassForBadge(classe.status) as TStatus} />}
        breadcrumb={[
          { title: "Séjours" },
          {
            title: "Classes",
            to: "/classes",
          },
          { title: page },
        ]}
        actions={getHeaderActionList({ user, classe, setClasse, isLoading, setIsLoading, url, id, studentStatus })}
      />
      <NavbarClasse classeId={id} />
    </>
  );
}
