import React from "react";
import styled from "styled-components";

export default ({ title, subtitle, handleChange, name, values, value }) => {
  Array.prototype.inArray = function (elem) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === elem) return true;
    }
    return false;
  };
  Array.prototype.pushIfNotExist = function (element) {
    if (!this.inArray(element)) {
      this.push(element);
    }
  };

  const onClick = () => {
    const d = values[name];
    const index = d.indexOf(value);
    if (index !== -1) {
      // delete from te array
      d.splice(index, 1);
    } else {
      // if already 3 domains, replace the older selected, else just push
      console.log(d);
      if (d.length >= 3) d.splice(0, 1);
      d.push(value);
      console.log(d);
    }
    handleChange({ target: { name: "domains", value: d } });
  };

  return (
    <Container selected={values[name] && values[name].indexOf(value) !== -1} onClick={onClick}>
      <p className="title">{title}</p>
      <p className="subtitle">{subtitle}</p>
    </Container>
  );
};

const Container = styled.div`
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  width: 50%;
  @media (max-width: 767px) {
    width: 90%;
  }
  padding: 1rem;
  border-width: ${({ selected }) => (selected ? "2px" : "1px")};
  border-radius: 0.5rem;
  border-style: solid;
  cursor: pointer;
  :hover {
    border-color: ${({ selected }) => (selected ? "#42389d" : "#9fa6b2")};
  }
  border-color: ${({ selected }) => (selected ? "#42389d" : "#d2d6dc")};
  margin: 0.5rem auto;
  .title {
    color: #161e2e;
    font-size: 0.875rem !important;
    font-weight: 500;
    margin-bottom: 0;
  }
  .subtitle {
    color: #6b7280;
    font-size: 0.875rem !important;
    font-weight: 300;
    margin-bottom: 0;
  }
`;
