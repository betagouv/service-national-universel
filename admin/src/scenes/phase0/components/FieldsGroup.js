import React, { useEffect, useState } from "react";
import { MiniTitle } from "./commons";
import CorrectionRequest from "./CorrectionRequest";
import Field from "./Field";

export function FieldsGroup({
  name,
  title,
  correctionLabel,
  className = "",
  children,
  noflex,
  mode,
  currentRequest,
  onStartRequest,
  correctionRequest,
  onCorrectionRequestChange,
}) {
  const [mouseIn, setMouseIn] = useState(false);
  const [group, setGroup] = useState({});
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setGroup({ ...group, hover: mouseIn });
  }, [mouseIn]);

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  function onFieldStartRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  const childs = children
    ? children.map((child, index) => {
        if (child.type === Field) {
          return React.cloneElement(child, { key: child.props.name, group, mode, onStartRequest: onFieldStartRequest, correctionRequest });
        } else {
          return React.cloneElement(child, { key: "child-" + index });
        }
      })
    : null;

  return (
    <>
      <div className={className} onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)}>
        {title && <MiniTitle>{title}</MiniTitle>}
        <div className={`${noflex ? "" : "flex items center"}`}>{childs}</div>
      </div>
      {opened && (
        <CorrectionRequest name={name} label={correctionLabel ? correctionLabel : title} correctionRequest={correctionRequest} onChangeRequest={onCorrectionRequestChange} />
      )}
    </>
  );
}
