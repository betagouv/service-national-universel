import React from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";

import Chevron from "../Chevron";
import Bin from "../../assets/Bin.js";
import Duplicate from "../../assets/Duplicate.js";
import Pencil from "../../assets/Pencil.js";
import Burger from "../../assets/Burger.js";

export default function ActionDropdown({ width, onDuplicate, onDelete, onEdit, ...props }) {
  return (
    <ActionBox width={width} {...props}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Burger className="icon" />
            <p className="text">Actions</p>
          </div>
          <Chevron />
        </DropdownToggle>
        <DropdownMenu>
          {onEdit && (
            <DropdownItem className="dropdown-item" icon="duplicate" onClick={onEdit}>
              <Pencil className="icon" />
              <p className="text">Modifier</p>
            </DropdownItem>
          )}
          {onDuplicate && (
            <DropdownItem className="dropdown-item" icon="duplicate" onClick={onDuplicate}>
              <Duplicate className="icon" />
              <p className="text">Dupliquer</p>
            </DropdownItem>
          )}
          {onDelete && (
            <DropdownItem className="dropdown-item" icon="duplicate" onClick={onDelete}>
              <Bin className="icon" />
              <p className="text">Supprimer</p>
            </DropdownItem>
          )}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
}

const ActionBox = styled.div`
  .dropdown-menu {
    width: ${({ width }) => width || `150px`};
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    background-color: #ffff;
    border: 1px solid #efefef;
    color: #262a3d;
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: ${({ width }) => width || `150px`};
    min-height: 34px;

    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      margin-left: 15px;
      svg {
        height: 10px;
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    display: flex;
    justify-content: start;

    :hover {
      background-color: #f3f3f3;
    }
  }
  .text {
    margin: 0;
    margin-left: 8px;
  }
  .icon {
    height: 0.8rem;
  }
`;
