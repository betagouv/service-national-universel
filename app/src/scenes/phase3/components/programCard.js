import React from "react";
import styled from "styled-components";

export default ({ title, image, details }) => {
  return (
    <Card>
      <div className="thumb">
        <img src={image} />
      </div>
      <h4>{title}</h4>
      <p>{details}</p>
    </Card>
  );
};

const Card = styled.div`
  margin-bottom: 50px;
  .thumb {
    margin-bottom: 20px;
    img {
      border-radius: 6px;
      max-width: 100%;
      height: 240px;
      object-fit: cover;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  }
  h4 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 0;
  }
  p {
    color: #6b7280;
    font-weight: 700;
  }
`;
