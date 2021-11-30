import React, { useEffect } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";

const ReactiveFilter = ({ query, componentId = "FILTER" }) => {
  return <ReactiveComponent componentId={componentId} render={(data) => <SubComponent query={query} {...data} />} />;
};

export default ReactiveFilter;

const SubComponent = ({ setQuery, query }) => {
  useEffect(() => {
    setQuery({ query, value: "" });
  }, []);
  return <div />;
};
