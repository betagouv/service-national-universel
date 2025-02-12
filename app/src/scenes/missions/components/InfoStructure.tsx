import React, { useState } from "react";
import Loader from "@/components/Loader";
import useStructure from "@/scenes/phase2/lib/useStructure";

export default function InfoStructure({ title, structureId }: { title: string; structureId: string }) {
  const { data, isPending, isError } = useStructure(structureId);
  const [expandNote, setExpandNote] = useState(false);

  if (isError) return <div>Une erreur est survenue</div>;
  if (isPending) return <Loader />;

  const value = data.description || "";
  const preview = value.substring(0, 200);
  const rest = value.substring(200);

  const toggleNote = () => {
    setExpandNote(!expandNote);
  };

  return value ? (
    <div className="my-3">
      <div className="text-xs uppercase text-gray-500">{title}</div>
      <div className="text-sm font-normal leading-5">
        {rest ? (
          <div className="my-2">
            <div dangerouslySetInnerHTML={{ __html: preview + (expandNote ? rest : " ...") + " " }} />
            <button className="see-more" onClick={toggleNote}>
              {expandNote ? "  VOIR MOINS" : "  VOIR PLUS"}
            </button>
          </div>
        ) : (
          preview
        )}
      </div>
    </div>
  ) : (
    <div />
  );
}
