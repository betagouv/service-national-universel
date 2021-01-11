import React, { useEffect } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";

export default ({ query, componentId = "FILTER" }) => {
  return <ReactiveComponent componentId={componentId} render={(data) => <SubComponent query={query} {...data} />} />;
};

const SubComponent = ({ setQuery, query }) => {
  useEffect(() => {
    setQuery({ query, value: "" });
  }, []);
  return <div />;
};
