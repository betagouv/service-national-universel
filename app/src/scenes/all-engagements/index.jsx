import React from "react";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { useQuery } from "@tanstack/react-query";
import { fetchPrograms } from "../phase2/engagement.repository";
import Loader from "@/components/Loader";
import EngagementCard from "../preinscription/components/EngagementCard";

const AllEngagements = () => {
  const { isPending, error, data: programs } = useQuery({ queryKey: ["program"], queryFn: fetchPrograms });

  return (
    <DSFRLayout>
      <DSFRContainer title="Tous les programmes d'engagement">
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

export default AllEngagements;
