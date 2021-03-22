import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

export default ({ program, image, enableToggle = true }) => {
  console.log(program);
  const [expandDetails, setExpandDetails] = useState(false);
  const preview = program.description.substring(0, 130);
  const rest = program.description.substring(130);

  const toggleDetails = () => {
    setExpandDetails(!expandDetails);
  };

  const renderText = () => {
    if (!enableToggle) return program.description;
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
      <a href={program.href} className="thumb">
        <img src={image} />
      </a>
      <Description>
        <h4>{program.name}</h4>
        <p>{renderText()}</p>
      </Description>
      <Actions id={program._id} />
    </Card>
  );
};

const Actions = ({ id }) => {
  return (
    <ActionStyle>
      <Link to={`/contenu/${id}/edit`}>
        <div>Edit</div>
      </Link>
      <div>Suppr</div>
    </ActionStyle>
  );
};

const ActionStyle = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Description = styled.div`
  padding: 1rem;
`;

const Card = styled.div`
  background-color: #fff;
  margin-bottom: 50px;
  border-radius: 1rem;
  overflow: hidden;
  .thumb {
    margin-bottom: 20px;
    img {
      margin-bottom: 20px;
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
