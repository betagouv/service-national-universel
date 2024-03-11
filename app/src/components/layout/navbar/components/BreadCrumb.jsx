import React from "react";
import { useLocation } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  const getBreadcrumbItems = () => {
    const path = location.pathname;
    let items = [];

    if (path.includes("/phase2")) {
      items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    }
    // Je laisse les commentaires car il peut y avoir un besoin dans le futur
    // Phase 2 MIG BreadCrumb
    // if (path.includes("/phase2/mig")) {
    //   items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    //   items.push({ label: "Réalisez votre mission d'intérêt général", to: "/phase2/mig" });
    // }
    // if (path.includes("/preferences")) {
    //   items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    //   items.push({ label: "Réalisez votre mission d'intérêt général", to: "/phase2/mig" });
    //   items.push({ label: "Mes préférences de missions", to: "/preferences" });
    // }
    // if (path.includes("/mission")) {
    //   items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    //   items.push({ label: "Réalisez votre mission d'intérêt général", to: "/phase2/mig" });
    //   items.push({ label: "Trouvez une mission d'intérêt général", to: "/mission" });
    // }
    // if (path.includes("/candidature")) {
    //   items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    //   items.push({ label: "Réalisez votre mission d'intérêt général", to: "/phase2/mig" });
    //   items.push({ label: "Mes candidatures", to: "/candidature" });
    // }
    // if (path.includes("/phase2/equivalence")) {
    //   items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    //   items.push({ label: "Réalisez votre mission d'intérêt général", to: "/phase2/mig" });
    //   items.push({ label: "Je demande la reconnaissance d'un engagement déjà réalisé", to: "/phase2/equivalence" });
    // }

    // Phase 2 Other Engagement BreadCrumb
    if (path.includes("/autres-engagements")) {
      items.push({ label: "Phase 2 - Engagements", to: "/phase2" });
      items.push({ label: "Autres Engagements", to: "/autres-engagements" });
    }
    // if (path.includes("/les-programmes")) {
    //   items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    //   items.push({ label: "Autres Engagements", to: "/autres-engagements" });
    //   items.push({ label: "Tous les autres programmes d'engagement", to: "/les-programmes" });
    // }
    // if (path.includes("/phase3/mission")) {
    //   items.push({ label: "Phase 2 - engagements", to: "/phase2" });
    //   items.push({ label: "Autres Engagements", to: "/autres-engagements" });
    //   items.push({ label: "Trouvez une mission de bénévolat", to: "/phase3/mission" });
    // }
    return items;
  };
  const breadcrumbItems = getBreadcrumbItems();
  return (
    <div className="sm:mb-8 flex ml-8 mt-8 items-center gap-3 text-gray-400">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <HiChevronRight />}
          <Link className="text-xs hover:text-snu-purple-300" to={item.to}>
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
