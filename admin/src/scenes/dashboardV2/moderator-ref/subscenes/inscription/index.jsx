import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineChartSquareBar, HiChartSquareBar, HiClipboardList } from "react-icons/hi";

import { Page, Header, DropdownButton, ModalConfirmation } from "@snu/ds/admin";

import plausibleEvent from "../../../../../services/plausible";
import ExportReport from "./ExportReport";
import DashboardContainer from "../../../components/DashboardContainer";
import BandeauInfo from "../../../components/BandeauInfo";
import General from "../../../components/inscription/General";

export default function Index() {
  const [selectedFilters, setSelectedFilters] = useState({
    cohort: [],
  });
  const user = useSelector((state) => state.Auth.user);
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
        breadcrumb={[{ title: <HiOutlineChartSquareBar size={20} /> }, { title: "Tableau de bord" }]}
        actions={[<DropdownButton title={"Exporter"} optionsGroup={selectOptions} key={"export"} position="right" />]}
      />
      <DashboardContainer active="inscription" availableTab={["general", "engagement", "sejour", "inscription"]}>
        <General selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
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
