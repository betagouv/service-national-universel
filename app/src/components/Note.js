import React from "react";
import styled from "styled-components";

export default function Note({ title, titleColor, text, textColor, link, textLink, linkColor, backgroundColor, icon, linkInText, ...rest }) {
  return (
    <NoteContainer {...rest} titleColor={titleColor} backgroundColor={backgroundColor} textColor={textColor} linkColor={linkColor}>
      <img src={icon} />
      <div className="content">
        <p className="title">{title}</p>
        {text ? (
          <p className="text">
            {text}{" "}
            {linkInText && (
              <a href={link} className="link">
                {textLink}
              </a>
            )}
          </p>
        ) : null}
        {link && !linkInText ? (
          <a href={link} className="link">
            {textLink}
          </a>
        ) : null}
      </div>
    </NoteContainer>
  );
}

const NoteContainer = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  margin: 1rem;
  border-radius: 6px;
  font-size: 0.7rem;
  color: #9a9a9a;
  background-color: #f6f6f6;
  img {
    width: 1.2rem;
    margin-right: 0.6rem;
    margin-top: 0.3rem;
  }
  p {
    margin: 0.2rem 0;
  }
  ${({ textColor, backgroundColor, titleColor }) => `
    color: ${textColor};
    background-color: ${backgroundColor};
    .title {
      color: ${titleColor}

    }
    .text {
      color: ${textColor}
    }
  `};
  .title {
    font-weight: 500;
    ${({ titleColor }) => `
    color: ${titleColor};
  `};
  }

  .text {
    ${({ textColor }) => `
    color: ${textColor};
  `};
    max-width: 250px;
  }

  .link {
    text-decoration: none;
    font-weight: 500;
    ${({ linkColor }) => `
    color: ${linkColor};
  `};
  }
  .link:hover {
    ${({ textColor }) => `
    color: ${textColor};
  `};
  }
`;
