import { useEffect, useMemo, useRef, useState } from "react";

// inspired from https://stackoverflow.com/a/53220241/5225096

const ResizablePanel = ({ children, name, position, className }) => {
  const side = ["left", "right"].includes(position) ? "width" : "height";

  const panelRef = useRef(null);
  const [panelLength, setPanelLength] = useState(() => {
    const savedWidth = window.localStorage.getItem(`snu-panel-${name}-length`);
    if (!!savedWidth) return Math.max(0, parseInt(savedWidth, 10));
    return null;
  });
  useEffect(() => {
    if (!panelLength) setPanelLength(parseInt(getComputedStyle(panelRef.current, "")[side], 10));
  }, []);
  const moveStart = useRef(null);
  const panelWidthRef = useRef(null);
  useEffect(() => {
    return () => document.removeEventListener("mousemove", resize, false);
  }, []);

  const siblingDivRef = useRef(null);

  useEffect(() => {
    panelWidthRef.current = panelLength;
  }, [panelLength]);

  const resize = (e) => {
    if (position === "right") {
      const dx = moveStart.current - e.screenX;
      moveStart.current = e.screenX;
      setPanelLength((l) => l + dx);
    }
    if (position === "left") {
      const dx = e.screenX - moveStart.current;
      moveStart.current = e.screenX;
      setPanelLength((l) => l + dx);
    }
    if (position === "bottom") {
      const dy = moveStart.current - e.screenY;
      moveStart.current = e.screenY;
      setPanelLength((l) => l + dy);
    }
  };

  const handleMouseUp = () => {
    siblingDivRef.current.classList.remove("select-none");
    window.localStorage.setItem(`snu-panel-${name}-length`, panelWidthRef.current);
    document.removeEventListener("mousemove", resize, false);
    document.removeEventListener("mouseup", handleMouseUp, false);
  };

  const handleMouseDown = (e) => {
    siblingDivRef.current = e.target[["left"].includes(position) ? "previousSibling" : "nextSibling"];
    siblingDivRef.current.classList.add("select-none");
    moveStart.current = e[["left", "right"].includes(position) ? "screenX" : "screenY"];
    document.addEventListener("mousemove", resize, false);
    document.addEventListener("mouseup", handleMouseUp, false);
  };

  const style = useMemo(() => {
    if (!!panelLength) return { [side]: panelLength };
    return {};
  }, [panelLength]);

  return (
    <aside ref={panelRef} className={className} style={style}>
      {position === "right" && <div className="h-full w-1 shrink-0 cursor-col-resize" onMouseDown={handleMouseDown} />}
      {position === "bottom" && <div className="h-1 w-full shrink-0 cursor-row-resize" onMouseDown={handleMouseDown} />}
      {children}
      {position === "left" && <div className="h-full w-1 shrink-0 cursor-col-resize" onMouseDown={handleMouseDown} />}
    </aside>
  );
};

export default ResizablePanel;
