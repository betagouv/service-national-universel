import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Loader from "../../components/Loader";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import api from "../../services/api";
import List from "./view/List";
import Unauthorized from "./view/Unauthorized";
import MobileList from "./view/MobileList";

export default function SessionShareIndex() {
  useDocumentTitle("Session/Bus");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [code, setCode] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  const params = queryString.parse(location.search);
  const { token } = params;

  if (!token) history.push("/");

  useEffect(() => {
    (async () => {
      try {
        const { ok, data } = await api.post(`/session-phase1/check-token/${token}`);
        if (ok) {
          setIsAuthorized(true);
          setData(data);
        }
        setIsLoading(false);
      } catch (e) {
        if (e.code) {
          setCode(e.code);
        }
        setIsAuthorized(false);
        setIsLoading(false);
      }
    })();
  }, []);

  return isLoading ? (
    <Loader />
  ) : isAuthorized ? (
    <>
      <div className="hidden flex-1 md:flex">
        <List data={data} />
      </div>
      <div className="flex flex-1 md:hidden">
        <MobileList data={data} />
      </div>
    </>
  ) : (
    <Unauthorized code={code} />
  );
}
