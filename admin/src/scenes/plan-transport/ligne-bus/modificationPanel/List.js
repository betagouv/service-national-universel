import React from "react";
import PanelV2 from "../../../../components/PanelV2";

export default function List({ open, setOpen }) {
  const onClose = () => {
    setOpen(false);
  };

  return <PanelV2 title="Demandes de modifications" open={open} onClose={onClose}></PanelV2>;
}
