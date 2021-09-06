import styled from "styled-components";
import { colors } from "../../../utils";

const Subtitle = styled.h2`
  position: relative;
  font-size: 1rem;
  color: ${colors.grey};
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 400;
  margin-bottom: 20px;
`;

export default Subtitle;
