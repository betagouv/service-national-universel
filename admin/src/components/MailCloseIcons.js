import React from "react";
import styled from "styled-components";

export default ({ ...props }) => (
  <MailContainer {...props}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.60254 4.70715L8.00014 7.90555L14.3977 4.70715C14.3741 4.29951 14.1954 3.91634 13.8984 3.63613C13.6014 3.35592 13.2085 3.19988 12.8001 3.19995H3.20014C2.79181 3.19988 2.3989 3.35592 2.10188 3.63613C1.80487 3.91634 1.62622 4.29951 1.60254 4.70715Z" fill="white"/>
      <path d="M14.4001 6.49438L8.0001 9.69438L1.6001 6.49438V11.2C1.6001 11.6243 1.76867 12.0313 2.06873 12.3314C2.36878 12.6314 2.77575 12.8 3.2001 12.8H12.8001C13.2244 12.8 13.6314 12.6314 13.9315 12.3314C14.2315 12.0313 14.4001 11.6243 14.4001 11.2V6.49438Z" fill="white"/>
    </svg>
  </MailContainer>
);

const MailContainer = styled.div`
  margin-left: auto;
  padding: 7px 15px;
  margin-left: 15px;
  svg {
    height: 10px;
  }
  svg polygon {
    fill: ${({ color }) => `${color}`};
  }
`;
