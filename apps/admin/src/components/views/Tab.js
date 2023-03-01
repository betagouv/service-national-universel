import styled from "styled-components";
import { colors } from "../../utils";
export default styled.li`
  min-width: 90px;
  margin: 0 0.3rem;
  height: 40px;
  text-align: center;
  padding: 0.5rem 1rem;
  position: relative;
  font-size: 1rem;
  color: #979797;
  cursor: pointer;
  font-weight: 300;
  border-radius: 0.5rem;
  overflow: hidden;
  :hover {
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }

  ${({ isActive }) =>
    isActive &&
    `
    color: #222;
    font-weight: 500;
    background-color:#fff;
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: ${colors.purple};
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  `}
  ${({ disabled }) => disabled && "color: #bbb;cursor: not-allowed;"}
`;
