import React, { useState } from "react";
import styled from "styled-components";

export default ({ title, image, details, href }) => {
  const [expandDetails, setExpandDetails] = useState(false);
  const preview = details.substring(0, 130);
  const rest = details.substring(130);

  const toggleDetails = () => {
    setExpandDetails(!expandDetails);
  };

  const renderText = () => {
    if (!rest) return preview;

    return (
      <>
        {preview}{" "}
        {expandDetails ? (
          <>
            {rest} <ToogleText onClick={toggleDetails}>réduire</ToogleText>
          </>
        ) : (
          <>
            ...<ToogleText onClick={toggleDetails}>lire plus</ToogleText>
          </>
        )}
      </>
    );
  };

  return (
    <Card>
      <a href={href} className="thumb">
        <img src={image} />
      </a>
      <h4>{title}</h4>
      <p>{renderText()}</p>
      <SeeMore href={href} target="_blank">
        DÉCOUVRIR
      </SeeMore>
    </Card>
  );
};

const Card = styled.div`
  margin-bottom: 50px;
  .thumb {
    margin-bottom: 20px;
    img {
      margin-bottom: 20px;
      border-radius: 6px;
      width: 100%;
      height: 200px;
      object-fit: cover;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  }
  h4 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  p {
    color: #6b7280;
    font-weight: 400;
  }
`;

const SeeMore = styled.a`
  :hover {
    color: #372f78;
  }
  cursor: pointer;
  color: #5145cd;
  font-size: 16px;
  font-weight: 600;
`;

const ToogleText = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  cursor: pointer;
`;
