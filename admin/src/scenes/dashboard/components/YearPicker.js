import React from "react";
import Select from "react-select";
import styled from "styled-components";
import { colors } from "../../../utils";

const YearPicker = ({ value = [], onChange }) => {
  let YEARS = [
    { label: "2019", value: "2019" },
    { label: "2020", value: "2020" },
    { label: "2021", value: "2021" },
    { label: "Février 2022", value: "Février 2022" },
    { label: "Juin 2022", value: "Juin 2022" },
    { label: "Juillet 2022", value: "Juillet 2022" },
  ];
  return (
    <Container>
      <Label>cohorte(s)</Label>
      <Select
        styles={{ placeholder: (provided) => ({ ...provided, position: "relative", transform: "" }) }}
        options={YEARS}
        isMulti
        placeholder="Choisir"
        onChange={(e) => onChange(e.map((v) => v.value))}
        value={YEARS.filter((y) => value.includes(y.value))}
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

export default YearPicker;
