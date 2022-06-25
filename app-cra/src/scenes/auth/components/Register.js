import styled from "styled-components";
import { Link } from "react-router-dom";

export default styled(Link)`
  width: 100%;
  display: block;
  font-size: 18px;
  font-weight: 700;
  border-radius: 0;
  padding: 12px;
  border: 0;
  background-color: #fff;
  margin-top: 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  color: #000;
  text-align: center;
  cursor: pointer;
  :hover {
    background-color: #f4f5f7;
    color: #000;
  }
`;
