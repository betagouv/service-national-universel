import styled from "styled-components";
import { FormGroup } from "reactstrap";

export default styled(FormGroup)`
  margin-bottom: 20px;
  div {
    display: flex;
    flex-direction: column-reverse;
  }
  label {
    color: #37415b;
    font-size: 14px;
    margin-bottom: 5px;
  }
`;
