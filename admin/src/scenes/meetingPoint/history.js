import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import HistoricComponent from "../../components/views/Historic";
import api from "../../services/api";
import { ROLES } from "../../utils";

export default function History(props) {
  const [meetingPoint, setMeetingPoint] = React.useState();
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  if (user.role !== ROLES.ADMIN) history.push("/");
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
