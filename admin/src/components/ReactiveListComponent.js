import React from "react";
import { ReactiveList } from "@appbaseio/reactivesearch";
import { TopResultStats, BottomResultStats } from "./list";
import { getResultLabel } from "../utils";

export default function ReactiveListComponent({
  showTopResultStats = true,
  showBottomResultStats = true,
  pageSize = 10,
  pagination = true,
  paginationAt = "both",
  URLParams = true,
  ...props
}) {
  return (
    <ReactiveList
      // default props
      componentId="result"
      pagination={pagination}
      paginationAt={paginationAt}
      innerClass={{ pagination: "pagination", sortOptions: "sort-options" }}
      size={pageSize}
      dataField="createdAt"
      sortBy="desc"
      showLoader={true}
      URLParams={URLParams}
      loader={<div style={{ position: "absolute", width: "100%", textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Chargement...</div>}
      renderNoResults={() => <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Aucun résultat.</div>}
      renderResultStats={(e) => {
        return (
          <>
            {showTopResultStats ? <TopResultStats>{getResultLabel(e, pageSize)}</TopResultStats> : null}
            {showBottomResultStats ? <BottomResultStats>{getResultLabel(e, pageSize)}</BottomResultStats> : null}
          </>
        );
      }}
      onError={() => {
        // if there is an error in ES, we redirect the user to the login screen.
        // we pass unauthorized=1 to specify that this is a redirection provoked by a expired session.
        // we add the redirect uri so that the user can be back where it was. (by removing the domain and the first /, we have the full uri in the correct format)
        window.location.href = `/auth?unauthorized=1&redirect=${encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1))}`;
      }}
      // props can be override
      // ex : defaultQuery, react, dataField, sortBy, render
      {...props}
    />
  );
}
