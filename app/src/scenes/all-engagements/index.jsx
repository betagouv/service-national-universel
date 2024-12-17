import React from "react";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import usePrograms from "../phase2/scenes/usePrograms";
import Loader from "@/components/Loader";
import EngagementCard from "../preinscription/components/EngagementCard";

const Index = () => {
  const { isPending, error, data: programs } = usePrograms();

  return (
    <DSFRLayout>
      <DSFRContainer title="Toutes les formes d'engagement">
        {isPending ? (
          <Loader />
        ) : error ? (
          <p>{error}</p>
        ) : (
          <section id="engagements" className="gap-8 grid grid-cols-1 md:grid-cols-2">
            {programs.map((program) => (
              <EngagementCard program={program} key={program._id} />
            ))}
          </section>
        )}
      </DSFRContainer>
    </DSFRLayout>
  );
};

export default Index;
