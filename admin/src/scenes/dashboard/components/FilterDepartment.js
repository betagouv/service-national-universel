import React from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { colors } from "../../../utils";
import { departmentList, region2department, REFERENT_ROLES } from "../../../utils";

export default ({ value = [], onChange, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  const filteredDepartment = () => {
    if (!filter.region?.length) return departmentList?.map((d) => ({ label: d, value: d }))?.sort((a, b) => a.label.localeCompare(b.label));
    return filter.region
      ?.reduce((previous, current) => previous?.concat(region2department[current]?.map((d) => ({ label: d, value: d }))), [])
      ?.sort((a, b) => a.label.localeCompare(b.label));
  };

  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
    return (
      <Container>
        <Label>Département</Label>
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
          options={[]}
          placeholder="Choisir"
          onChange={() => {}}
          value={filteredDepartment().filter((y) => value.includes(y.value))}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Label>Département(s)</Label>
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
        options={filteredDepartment()}
        isMulti
        placeholder="Choisir"
        onChange={(e) => onChange(e.map((v) => v.value))}
        value={filteredDepartment().filter((y) => value.includes(y.value))}
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
