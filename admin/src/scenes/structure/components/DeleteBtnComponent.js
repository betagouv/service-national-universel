import * as React from "react";
import styled from "styled-components";

const DeleteBtnComponent = (props) => <DeleteBtn {...props}>{"🗑"}</DeleteBtn>;

export default DeleteBtnComponent;

const DeleteBtn = styled.button`
  border: 4px solid #ce2027;
  border-radius: 50%;
  padding: 7px 10px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #ce2027;
  }
`;
