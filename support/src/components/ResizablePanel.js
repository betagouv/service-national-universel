import { useEffect, useMemo, useRef, useState } from "react";

// inspired from https://stackoverflow.com/a/53220241/5225096

const ResizablePanel = ({ children, name, position, className, Tag = "aside" }) => {
  const panelRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(() => {
    const savedWidth = window.localStorage.getItem(`snu-panel-${name}-width`);
    if (!!savedWidth) return parseInt(savedWidth, 10);
    return null;
  });
  useEffect(() => {
    if (!panelWidth) setPanelWidth(parseInt(getComputedStyle(panelRef.current, "").width, 10));
  }, []);
  const moveStart = useRef(null);
  const panelWidthRef = useRef(null);
  useEffect(() => {
    return () => document.removeEventListener("mousemove", resize, false);
  }, []);

  useEffect(() => {
    panelWidthRef.current = panelWidth;
  }, [panelWidth]);

  const resize = (e) => {
    if (position === "right") {
      const dx = moveStart.current - e.screenX;
      moveStart.current = e.screenX;
      setPanelWidth((w) => w + dx);
    }
    if (position === "left") {
      const dx = e.screenX - moveStart.current;
      moveStart.current = e.screenX;
      setPanelWidth((w) => w + dx);
    }
  };

  const handleMouseUp = () => {
    window.localStorage.setItem(`snu-panel-${name}-width`, panelWidthRef.current);
    document.removeEventListener("mousemove", resize, false);
    document.removeEventListener("mouseup", handleMouseUp, false);
  };

  const handleMouseDown = (e) => {
    moveStart.current = e.screenX;
    document.addEventListener("mousemove", resize, false);
    document.addEventListener("mouseup", handleMouseUp, false);
  };

  const style = useMemo(() => {
    if (!!panelWidth) return { width: panelWidth };
    return {};
  }, [panelWidth]);

  return (
    <Tag ref={panelRef} className={className} style={style}>
      {position === "right" && <div className="w-1 bg-coolGray-300 h-full flex-shrink-0 cursor-col-resize" onMouseDown={handleMouseDown} />}
      {children}
      {position === "left" && <div className="w-1 bg-coolGray-300 h-full flex-shrink-0 cursor-col-resize" onMouseDown={handleMouseDown} />}
    </Tag>
  );
};

export default ResizablePanel;
