import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../utils";

export default function ExpandComponent({ children, showMoreText = "Voir plus", showLessText = "Voir moins" }) {
  const [expand, setExpand] = useState(false);

  return (
    <Expand>
      {expand ? (
        <>
          <div className="container">{children}</div>
        </>
      ) : null}
      <div className="see-more" onClick={() => setExpand((e) => !e)}>
        {expand ? showLessText : showMoreText}
      </div>
    </Expand>
  );
}

const Expand = styled.ul`
  list-style-type: none;
  > li {
    ::before {
      content: "";
      display: block;
      border: 2px solid #dfdfdf;
      background-color: white;
      height: 0.7rem;
      width: 0.7rem;
      border-radius: 50%;
      position: relative;
      left: calc(-1rem - 5px);
      top: 32px;
      z-index: 1;
    }
    :not(:last-child) {
      position: relative;
      ::after {
        content: "";
        display: block;
        height: 100%;
        width: 1px;
        background-color: #dfdfdf;
        position: absolute;
        left: 0;
        top: 32px;
        z-index: -1;
      }
    }
  }
  .container {
    color: rgb(156, 156, 156);
    margin-bottom: 0.5rem;
  }
  .see-more {
    font-style: normal;
    color: #696974;
    margin-bottom: 0.8rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    :hover {
      color: ${colors.purple};
    }
  }
`;
