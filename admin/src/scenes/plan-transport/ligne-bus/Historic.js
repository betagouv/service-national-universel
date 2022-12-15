import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Loader from "../../../components/Loader";
import HistoryComponent from "../../../components/views/Historic2";
import API from "../../../services/api";
import { formatHistory } from "../../../utils";
import { Title } from "../components/commons";
import Select from "../components/Select";
import { cohortList } from "../util";

export default function Historic() {
  const [loading, setLoading] = React.useState(false);
  const user = useSelector((state) => state.Auth.user);
  const [cohort, setCohort] = React.useState("Février 2023 - C");
  const [data, setData] = React.useState([]);
  console.log("🚀 ~ file: Historic.js:17 ~ Historic ~ data", data);
  const formattedData = formatHistory(data, user.role);
  const filters = [];

  // Insert fetch and format logic here
  const getPatches = async () => {
    setLoading(true);
    try {
      const { ok, data } = await API.get(`/ligne-de-bus/patches/${cohort}`);
      if (!ok) return;
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPatches();
  }, [cohort]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport" }, { label: "Historique du plan de transport" }]} />
      <div className="w-full px-8 pt-3 pb-4">
        <div className="flex pb-6 items-center justify-between">
          <Title>Historique du plan de transport</Title>
          <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
        </div>
        {loading ? <Loader /> : <HistoryComponent model="young" data={formattedData} customFilterOptions={filters} refName={"Ligne"} />}
      </div>
    </>
  );
}
