import React from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { colors } from "../../../utils";
import { regionList, REFERENT_ROLES } from "../../../utils";

export default ({ value = [], onChange, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  const options = regionList.map((region) => ({ label: region, value: region }))?.sort((a, b) => a.label.localeCompare(b.label));

  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return <div />;

  if (user.role === REFERENT_ROLES.REFERENT_REGION) {
    return (
      <Container>
        <Label>Région</Label>
        <Select
          disabled
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
          isMulti
          options={[]}
          placeholder="Choisir"
          onChange={() => {}}
          value={options?.filter((y) => value.includes(y.value))}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Label>Région</Label>
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
                cursor: "pointer",
              },
              ":active": {
                ...provided[":active"],
                backgroundColor: "red",
              },
            };
          },
        }}
        isMulti
        options={options}
        placeholder="Choisir"
        onChange={(e) => onChange(e.map((v) => v.value))}
        value={options?.filter((y) => value.includes(y.value))}
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
