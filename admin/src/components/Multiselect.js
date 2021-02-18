import React from "react";
import MultiSelect from "react-multi-select-component";
import styled from "styled-components";
import { translate } from "../utils";

export default ({ value, name, onChange, options, placeholder }) => {
  const transformOptions = options.map((e) => {
    return { label: translate(e), value: e };
  });

  function valueForMultiselect(options, values) {
    const arr = [];
    for (let i in values) {
      const value = values[i];
      const option = options.find((e) => e.value === value);
      const obj = { label: option.label, value: option.value };
      arr.push(obj);
    }
    return arr;
  }

  function handleChange(v) {
    const arr = transformOptions.slice.call(v).map((option) => option.value);
    onChange({ target: { value: arr, name } });
  }
  const selected = valueForMultiselect(transformOptions, value);
  return (
    <Wrapper>
      <MultiSelect
        hasSelectAll={false}
        disableSearch={true}
        options={transformOptions}
        value={selected}
        onChange={(v) => handleChange(v)}
        overrideStrings={{ selectSomeItems: placeholder }}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .dropdown-container:focus-within,
  .dropdown-container:focus {
    border-color: #aaa;
  }
  cursor: pointer;
  div.item-renderer {
    display: flex;
    align-items: center;
    width: 100%;
  }
  div {
    width: 100%;
    span {
      text-transform: capitalize;
      color: #6a6f85;
      font-size: 14px;
      margin-right: 0;
    }
    input {
      border-radius: 0;
      border: 0;
    }
    input[type="checkbox"] {
      width: auto;
      margin-right: 5px;
    }
  }
`;
