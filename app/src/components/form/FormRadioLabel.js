import styled from "styled-components";

export default styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
  margin-bottom: 15px;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    width: 15px;
    height: 15px;
  }
`;
