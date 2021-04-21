import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Dropdown = ({ prelabel = "", onChange, options, selectedOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onOutsideClicked = () => setIsOpen(false);
  const toggleDropdown = (event) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    setIsOpen(!isOpen);
  };
  const onHandleSelect = (option) => (event) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    if (selectedOption === option) {
      onChange("");
    } else {
      onChange(option);
    }
    setIsOpen(false);
  };

  if (typeof options === "function") options = options();

  useEffect(() => {
    document.addEventListener("click", onOutsideClicked);
    return () => document.removeEventListener("click", onOutsideClicked);
  }, []);

  return (
    <DropdownWrapper isOpen={isOpen}>
      <DropdownHeading onClick={toggleDropdown}>
        <div>
          {prelabel}:<StyledLabel>{!!selectedOption && selectedOption}</StyledLabel>
        </div>
        <IconContainer onClick={!!selectedOption && onHandleSelect("")}>{!!selectedOption ? <Close /> : <StyledArrow isOpen={isOpen} />}</IconContainer>
      </DropdownHeading>
      {isOpen && (
        <DropdownList>
          {options.map((option) => (
            <DropdownItem key={option} onClick={onHandleSelect(option)}>
              {option}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </DropdownWrapper>
  );
};

export default Dropdown;

const DropdownWrapper = styled.div`
  position: relative;
  z-index: 10;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  ${(props) =>
    !props.isOpen &&
    `
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  `}
  min-width: 200px;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  background-color: white;
`;
const DropdownHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0 0px 10px;
  cursor: pointer;
`;
const StyledLabel = styled.span`
  font-weight: bold;
  color: #44444f;
  padding-left: 10px;
`;

const IconContainer = styled.div`
  width: 35px;
  height: 35px;
  border-left: 1px solid #f1f1f5;
  margin-left: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledArrow = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${require("../../../assets/dropdown_arrow.png")});
  background-repeat: no-repeat;
  background-position: center center;
  ${(props) =>
    !props.isOpen &&
    `
    border-bottom: 1px solid #F1F1F5;
    border-left: none;
    transform: rotate(90deg);
  `}
`;
const Close = styled.div`
  width: 30%;
  height: 30%;
  background-image: url(${require("../../../assets/close.svg")});
  background-repeat: no-repeat;
  background-position: center center;
`;
const DropdownList = styled.ul`
  transform: translateY(100%);
  background-color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  list-style-type: none;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
`;
const DropdownItem = styled.li`
  padding-left: 10px;
  cursor: pointer;
  :hover {
    background-color: #f1f1f5;
  }

  &:last-child {
    padding-bottom: 5px;
  }
`;
