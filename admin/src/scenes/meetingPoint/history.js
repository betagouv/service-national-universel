import React from "react";
import HistoricComponent from "../../components/views/Historic";
import Breadcrumbs from "../../components/Breadcrumbs";
import api from "../../services/api";

export default function History(props) {
  const [meetingPoint, setMeetingPoint] = React.useState();

  React.useEffect(() => {
    const id = props.match && props.match.params && props.match.params.id;
    (async () => {
      const { data, ok } = await api.get(`/meeting-point/${id}`);
      if (!ok) return;
      setMeetingPoint(data);
    })();
  }, []);

  if (!meetingPoint) return null;
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Points de rassemblement", to: `/point-de-rassemblement` },
          { label: "Fiche du point de rassemblement", to: `/point-de-rassemblement/${props?.match?.params?.id}/edit` },
          { label: "Historique" },
        ]}
      />
      <div className="flex w-full p-8">
        <HistoricComponent model="meeting-point" value={meetingPoint} />
      </div>
    </>
  );
}
