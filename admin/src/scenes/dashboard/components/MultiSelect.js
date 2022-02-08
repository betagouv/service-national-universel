import React from "react";
import Select, { components } from "react-select";
import styled from "styled-components";
import { colors } from "../../../utils";

const MultiSelect = ({ disabled, label, value = [], onChange, options, placeholder = "Choisir" }) => {
  return (
    <Container>
      <Select
        isDisabled={disabled}
        noOptionsMessage={() => "Aucune option"}
        styles={{
          control: (provided) => ({ ...provided, border: 0, borderRadius: "0.4rem", filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05))" }),
          placeholder: (provided) => ({ ...provided, position: "relative", transform: "" }),
          multiValue: (provided) => ({ ...provided, borderRadius: "0.25rem", backgroundColor: "#5145cd29" }),
          clearIndicator: (provided) => ({ ...provided, cursor: "pointer" }),
          dropdownIndicator: (provided) => ({ ...provided, cursor: "pointer" }),
          multiValueRemove: (provided) => ({ ...provided, cursor: "pointer" }),
          indicatorsContainer: (provided) => ({ ...provided, flexDirection: "row-reverse" }),
          option: (provided, state) => {
            return {
              ...provided,
              backgroundColor: state.isFocused ? "#5145cd29" : "",
              ":hover": {
                ...provided[":hover"],
                backgroundColor: "#5145cd29",
                cursor: "pointer",
              },
              ":active": {
                ...provided[":active"],
                backgroundColor: "red",
              },
            };
          },
        }}
        components={{
          ValueContainer: ({ children, ...props }) => {
            return (
              <components.ValueContainer {...props}>
                {label ? <Label>{label} :</Label> : null} {children}
              </components.ValueContainer>
            );
          },
          IndicatorSeparator: () => null,
        }}
        options={options?.sort((a, b) => a.label.localeCompare(b.label))}
        isMulti
        placeholder={placeholder}
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
  font-size: 0.8rem;
  color: ${colors.darkPurple};
`;

export default MultiSelect;
