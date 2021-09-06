import styled from "styled-components";
import { colors } from "../../utils";

export const ModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #fff;
  padding-top: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  img {
    position: absolute;
    right: 0;
    top: 0;
    margin: 1rem;
    cursor: pointer;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: ${colors.red};
`;

export const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  padding-top: 0;
  h1 {
    font-size: 1.4rem;
    color: #000;
  }
  p {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: ${colors.grey};
  }
  textarea {
    padding: 1rem;
    line-height: 1.5;
    border-radius: 0.5rem;
    border: 1px solid ${colors.grey};
    min-width: 100%;
    margin-bottom: 2rem;
  }
`;

export const Footer = styled.div`
  background-color: #f3f3f3;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  input {
    text-align: center;
    min-width: 80%;
    max-width: 80%;
    border: 1px solid ${colors.grey};
    border-radius: 10px;
    padding: 7px 30px;
  }
  > * {
    margin: 0.3rem 0;
  }
  p {
    color: ${colors.grey};
    font-size: 0.8rem;
    font-weight: 400;
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;
