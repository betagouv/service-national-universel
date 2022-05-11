import * as React from "react";
import styled from "styled-components";
import Bin from "../../../assets/Bin";

const DeleteBtnComponent = (props) => (
  <DeleteBtn>
    <Bin {...props}></Bin>
  </DeleteBtn>
);

export default DeleteBtnComponent;

const DeleteBtn = styled.button`
  border: 4px solid #ce2027;
  border-radius: 20%;
  padding: 2px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #ce2027;
  }
`;
