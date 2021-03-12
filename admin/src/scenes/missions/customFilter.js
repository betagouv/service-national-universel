import React, { useEffect } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";

export default ({ title, componentId, field }) => {
  return <ReactiveComponent componentId={componentId} render={({ setQuery, value }) => <Select setQuery={setQuery} title={title} field={field} value={value} />} />;
};

const Select = ({ setQuery, title, field, value }) => {
  useEffect(() => {
    if (!value) update("");
  }, [value]);

  function update(v) {
    let query = null;
    if (v === "oui") {
      query = { range: { [field]: { gt: 0 } } };
    } else if (v === "non") {
      query = { range: { [field]: { lte: 0 } } };
    } else {
      query = { match_all: {} };
    }
    setQuery({ query, value: v });
  }

  return (
    <ActionBox>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          {title}
          <svg viewBox="0 0 407.437 407.437">
            <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
          </svg>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem tag="div" onClick={() => update("oui")}>
            Oui
          </DropdownItem>
          <DropdownItem tag="div" onClick={() => update("non")}>
            Non
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};

const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 100%;
    div {
      white-space: nowrap;
      font-size: 16px;
      padding: 10px 15px;
      cursor: pointer;
    }
  }
  div button {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    padding: 14px 20px;
    font-size: 13px;
    width: 100%;
    font-weight: 400;
    color: #646b7d;
    cursor: pointer;
    outline: 0;
    :hover {
      svg polygon {
        fill: rgb(49, 130, 206);
      }
    }
    svg {
      height: 13px;
    }
  }
`;
