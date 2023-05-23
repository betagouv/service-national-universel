import React from "react";
import MoreInfoPanel from "../../../../components/ui/MoreInformationPanel";
import { Link } from "react-router-dom";

export default function StatusText({ status, nb, percentage, infoPanel, url, onClick = () => {} }) {
  function localOnClick(props) {
    props.event.stopPropagation();
    onClick(props);
  }

  function clickOnStatus(event) {
    console.log("click on status Event: ", event);
  }

  return (
    <div className="flex w-full items-center justify-between gap-2" onClick={(event) => localOnClick({ event, status, nb })}>
      {url ? (
        <Link to={url} target="_blank" className="flex w-[80%] items-center justify-start gap-2">
          <span className="w-[20%] text-lg font-bold text-gray-900">{nb}</span>
          <div className="flex w-[80%] items-center text-left text-sm text-gray-600" onClick={(event) => clickOnStatus(event)}>
            {status}
            {infoPanel && <MoreInfoPanel className="inline-block">{infoPanel}</MoreInfoPanel>}
          </div>
        </Link>
      ) : (
        <div className="flex w-[80%] items-center justify-start gap-2">
          <span className="w-[20%] text-lg font-bold text-gray-900">{nb}</span>
          <div className="flex w-[80%] items-center text-left text-sm text-gray-600">
            {status}
            {infoPanel && <MoreInfoPanel className="inline-block">{infoPanel}</MoreInfoPanel>}
          </div>
        </div>
      )}
      <p className="text-sm text-gray-400">({percentage}%)</p>
    </div>
  );
}
