import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CustomInput } from "reactstrap";

const MONTH = {
  0: "jan.",
  1: "fev.",
  2: "mars",
  3: "avril",
  4: "mai",
  5: "juin",
  6: "juill.",
  7: "août",
  8: "sept.",
  9: "oct.",
  10: "nov.",
  11: "dec.",
};

export default ({ value, onChange, placeholder, onSelect }) => {
  const [y, m, d] = value ? value.substring(0, 10).split("-") : ["", "", ""];
  const [day, setDay] = useState(parseInt(d));
  const [month, setMonth] = useState(parseInt(m - 1));
  const [year, setYear] = useState(parseInt(y));

  const handleDay = (e) => {
    setDay(e.target.value);
  };
  const handleMonth = (e) => {
    setMonth(e.target.value);
  };
  const handleYear = (e) => {
    setYear(e.target.value);
  };

  useEffect(() => {
    if (!day || !month || !year) return;
    const date = new Date(Date.UTC(parseInt(year), parseInt(month), parseInt(day)));
    const dateFormat = date.toISOString();
    onChange(dateFormat);
  }, [day, month, year]);

  const range = (start, end) => {
    return Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);
  };
  return (
    <Wrapper>
      <Input id="day" name="day" value={day} onChange={handleDay} type="select">
        <option value="">jour</option>
        {range(1, 31).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Input>
      <Separator>/</Separator>
      <Input id="month" name="month" value={month} onChange={handleMonth} type="select">
        <option value="">mois</option>
        {range(0, 11).map((m) => (
          <option key={m} value={m}>
            {MONTH[m]}
          </option>
        ))}
      </Input>
      <Separator>/</Separator>
      <Input id="year" name="year" value={year} onChange={handleYear} type="select">
        <option value="">année</option>
        {range(1990, 2020).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Input>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled(CustomInput)`
  max-width: ${({ name }) => {
    if (name === "day") return "5rem";
    if (name === "month") return "6rem";
    if (name === "year") return "6rem";
  }};
  height: 2.25rem;
  display: flex;
  align-items: center;
  padding: 0 1.75rem 0 0.75rem;
`;

const Separator = styled.div`
  margin: 0 1rem;
`;
