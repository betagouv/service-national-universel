import React from "react";
import { ReactiveList } from "@appbaseio/reactivesearch";
import { TopResultStats, BottomResultStats } from "./list";

export default (props) => {
  return (
    <ReactiveList
      // default props
      componentId="result"
      pagination={true}
      paginationAt="both"
      innerClass={{ pagination: "pagination" }}
      size={10}
      dataField="createdAt"
      sortBy="desc"
      showLoader={true}
      loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
      renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun résultat.</div>}
      renderResultStats={(e) => {
        return (
          <>
            <TopResultStats>
              Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
            </TopResultStats>
            <BottomResultStats>
              Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
            </BottomResultStats>
          </>
        );
      }}
      onError={() => {
        window.location.href = "/auth?unauthorized=1";
      }}
      // props can be override
      // ex : defaultQuery, react, dataField, sortBy, render
      {...props}
    />
  );
};
