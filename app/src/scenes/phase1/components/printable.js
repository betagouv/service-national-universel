import styled from "styled-components";
import { Row, Col } from "reactstrap";

export const SuccessMessage = styled.div`
  padding: 0.5rem;
  margin: 0 auto;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #046c4e;
  font-size: 0.8rem;
  width: fit-content;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  margin-bottom: 15px;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 1.25rem;
    width: 16px;
    height: 16px;
  }
  label {
    color: #4b5563;
    font-size: 1rem;
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
    width: 100%;
  }
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;

export const FormGroup = styled.div`
  width: 100%;
  margin-bottom: 25px;
  label {
    font-size: 1rem;
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  textarea,
  input {
    display: block;
    width: 100%;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;

export const FormRow = styled(Row)`
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
  }
`;

export const ConsentementBox = styled.div`
  width: 60%;
  padding: 3rem;
  border-radius: 8px;
  margin: auto;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
    width: 100%;
    padding: 1rem;
  }
  .noPrint {
    @media print {
      display: none;
    }
  }
  .onlyPrint {
    display: none;
    @media print {
      display: block;
    }
  }
  @media print {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    padding: 2rem;
    z-index: 999;
  }
`;

export const Title = styled.div`
  position: relative;
  text-align: center;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 700;
  margin: 1rem 0;
  ::after {
    content: "";
    display: block;
    height: 1px;
    width: 100%;
    background-color: #d2d6dc;
    position: absolute;
    left: 0;
    top: 50%;
    @media (max-width: 768px) {
      top: 110%;
    }
    transform: translateY(-50%);
    z-index: -1;
  }
  span {
    padding: 0 10px;
    background-color: #fff;
    color: rgb(22, 30, 46);
  }
`;

export const Logo = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: #def7ec;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  img {
    color: #057a55;
  }
`;

export const DownloadText = styled.div`
  font-size: 0.8rem;
  color: #555;
  width: 100%;
  text-align: center;
  margin-top: 0.2rem;
  margin-bottom: 1rem;
  a {
    color: #5850ec;
  }
`;

export const BackButton = styled.a`
  cursor: pointer;
  color: #374151;
  text-align: center;
  margin-top: 1rem;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
`;

export const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
  :not(:last-child) {
    border-bottom-width: 1px;
    border-color: #d2d6dc;
    border-bottom-style: dashed;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    margin-top: 0.5rem;
    font-size: 1.125rem !important;
    @media (max-width: 768px) {
      font-size: 0.8rem !important;
    }
    font-weight: 400 !important;
  }
`;

export const SignBox = styled.div`
  margin-top: 3rem;
  * {
    margin-bottom: 3rem;
  }
`;

export const Info = styled.div`
  margin: 2rem;
  @media (max-width: 768px) {
    margin: 0;
  }
  margin-top: 0;
  font-style: italic;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 400;
  span {
    font-style: normal;
    color: #000;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    :hover {
      color: #5145cd;
    }
  }
  li {
    margin: 0.5rem;
  }
`;

export const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  margin-top: 40px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;
