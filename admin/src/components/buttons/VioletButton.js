import styled from "styled-components";

const VioletButton = styled.div`
  > * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: #5245cc;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    margin: 0;
    margin-left: 1rem;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;

export default VioletButton;
