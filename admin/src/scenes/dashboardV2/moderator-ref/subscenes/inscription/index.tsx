import React, { useState } from "react";
import { useSelector } from "react-redux";

import { Page, Header, DropdownButton, ModalConfirmation } from "@snu/ds/admin";

import { AuthState } from "@/redux/auth/reducer";
import plausibleEvent from "@/services/plausible";
import DashboardContainer from "../../../components/DashboardContainer";
import BandeauInfo from "../../../components/BandeauInfo";
import General from "../../../components/inscription/General";
import ExportReport from "./ExportReport";

export default function Index() {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const [selectedFilters, setSelectedFilters] = useState<{ cohort: string[]; department?: string; region?: string; academy?: string }>({
    cohort: [],
  });
  const [modalExport, setModalExport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("0 %");

  const selectOptions = [
    {
      key: "1",
      title: "Exporter",
      items: [
        {
          key: "1.1",
          render: (
            <p>
              Le rapport <span>"Inscription"</span>
            </p>
          ),
          action: () => {
            setModalExport(true);
          },
        },
        {
          key: "1.2",
          render: (
            <p>
              Les statistiques <span>"Inscription"</span>
            </p>
          ),
          action: () => {
            plausibleEvent("Dashboard/CTA - Exporter statistiques inscriptions");
            print();
          },
        },
      ],
    },
  ];

  return (
    <Page>
      <BandeauInfo />
      <Header
        title="Tableau de bord"
        breadcrumb={[{ title: "Tableau de bord" }]}
        actions={[<DropdownButton title={"Exporter"} optionsGroup={selectOptions} key={"export"} position="right" />]}
      />
      <DashboardContainer active="inscription" availableTab={["general", "engagement", "sejour", "inscription"]}>
        <General selectedFilters={selectedFilters} onSelectedFiltersChange={setSelectedFilters} />
      </DashboardContainer>
      <ModalConfirmation
        isOpen={modalExport}
        onClose={() => {
          setModalExport(false);
        }}
        className="md:max-w-[700px]"
        title="Téléchargement"
        text="En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)"
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: `${loading ? `Téléchargement ${loadingText}` : "Confirmer"}`,
            disabled: loading,
            onClick: () => {
              plausibleEvent("Dashboard/CTA - Exporter rapport Inscription");
              ExportReport({ filter: selectedFilters, user, setLoading, setLoadingText });
            },
          },
        ]}
      />
    </Page>
  );
}
