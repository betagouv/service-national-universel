import React, { useState, useEffect } from "react";
import queryString from "query-string";
import { useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";

import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import Loader from "../../components/Loader";

export default ({ location }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const params = queryString.parse(location.search);
  const { token, young_id } = params;

  if (!token || !young_id) {
    return <Redirect to="/" />;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { ok, data, token } = await api.post(`/referent/signin_as/young/${young_id}`);
        if (!ok) return setLoading(false);
        await init({ data, token });
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function init({ token, data }) {
    if (token) api.setToken(token);

    if (!data) return;
    dispatch(setYoung(data));
  }

  if (loading) return <Loader />;
  return <Redirect to="/" />;
};
