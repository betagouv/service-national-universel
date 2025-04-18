import React from "react";
import styled from "styled-components";
import LoadingButton from "./LoadingButton";
// import Eye from "../../../../admin/src/assets/panel-icons/eye";
// import Pencil from "../../../../admin/src/assets/panel-icons/pencile";
// import Duplicate from '../../../../admin/src/assets/panel-icons/duplicate'
// import Impersonate from '../../../../admin/src/assets/panel-icons/impersonate'

// a revoir comment gérer ces icons
// const icons = {
//   eye: Eye,
//   pencil: Pencil,
//   duplicate: Duplicate,
//   impersonate: Impersonate,
// };

// todo - les virer de /assets et utiliser des url d'image normales
const images = import.meta.glob("../../assets/panel-icons/*.svg", { eager: true });

export default function PanelActionButton({ icon, title, ...rest }) {
  return (
    // <Button icon={icons[icon]} color="#fff" {...rest}>
    <Button icon={icon ? images[`../../assets/panel-icons/${icon}.svg`]?.default : null} color="#fff" {...rest}>
      {title}
    </Button>
  );
}

const Button = styled(LoadingButton)`
  color: #555 !important;
  background: ${({ icon }) => icon && `url(${icon})`};
  background-repeat: no-repeat;
  background-position: left 15px center;
  background-size: 15px 15px;
  background-color: #fff;
  :hover {
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }
  border: 1px solid #eee;
  outline: 0;
  border-radius: 5px;
  padding: 0.2rem 1rem;
  padding-left: ${({ icon }) => icon && `2.5rem`};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin: 0.5rem 0.5rem 0 0;
`;
