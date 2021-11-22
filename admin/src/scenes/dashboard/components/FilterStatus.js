import React from "react";
import Select from "react-select";
import styled from "styled-components";
import { colors, YOUNG_STATUS, ROLES, translate } from "../../../utils";
import { useSelector } from "react-redux";

const FilterStatus = ({ value = [], onChange }) => {
  const user = useSelector((state) => state.Auth.user);
  let STATUS = Object.keys(YOUNG_STATUS).map((s) => ({ label: translate(YOUNG_STATUS[s]), value: s }));
  if (user.role !== ROLES.ADMIN) STATUS = STATUS.filter((e) => e.value !== "IN_PROGRESS");

  return (
    <Container>
      <Label>statut(s)</Label>
      <Select
        styles={{ placeholder: (provided) => ({ ...provided, position: "relative", transform: "" }) }}
        options={STATUS}
        isMulti
        placeholder="Choisir"
        onChange={(e) => onChange(e.map((v) => v.value))}
        value={STATUS.filter((y) => value.includes(y.value))}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
const Label = styled.div`
  font-size: 0.7rem;
  color: ${colors.darkPurple};
  text-transform: uppercase;
`;

export default FilterStatus;
