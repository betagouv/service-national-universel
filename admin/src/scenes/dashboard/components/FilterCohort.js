import React from "react";
import Select from "react-select";
import styled from "styled-components";
import { colors } from "../../../utils";

const FilterCohort = ({ value = [], onChange, options }) => {
  return (
    <Container>
      <Label>cohorte(s)</Label>
      <Select
        styles={{
          placeholder: (provided) => ({ ...provided, position: "relative", transform: "" }),
          multiValue: (provided) => ({ ...provided, backgroundColor: "#5145cd29" }),
          option: (provided, state) => {
            return {
              ...provided,
              backgroundColor: state.isFocused ? "#5145cd29" : "",
              ":hover": {
                ...provided[":hover"],
                backgroundColor: "#5145cd29",
              },
              ":active": {
                ...provided[":active"],
                backgroundColor: "red",
              },
            };
          },
        }}
        options={options}
        isMulti
        placeholder="Choisir"
        onChange={(e) => onChange(e.map((v) => v.value))}
        value={options.filter((y) => value.includes(y.value))}
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

export default FilterCohort;
