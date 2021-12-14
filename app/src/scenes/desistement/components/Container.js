import styled from "styled-components";

export const Container = styled.div`
  margin: 1rem auto;
  max-width: 900px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50%;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  padding-top: 0;
  h1 {
    font-size: 2rem;
    color: #000;
  }
  p {
    font-size: 1rem;
    margin: 0;
    color: #6e757c;
  }
  textarea {
    padding: 1rem;
    line-height: 1.5;
    border-radius: 0.5rem;
    border: 1px solid #ced4da;
    min-width: 100%;
    margin-bottom: 2rem;
  }
`;
