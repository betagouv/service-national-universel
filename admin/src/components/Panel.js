/* eslint-disable no-irregular-whitespace */
import React from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { copyToClipboard } from "../utils";

export const Info = ({ children, title }) => {
  return (
    <div className="info">
      <div style={{ position: "relative" }}>
        <div className="info-title">{title}</div>
      </div>
      {children}
    </div>
  );
};

export const Details = ({ title, value, copy }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="detail">
      {/* `${title}&nbsp;:` */}
      <div className="detail-title">{`${title} :`}</div>
      <div style={{ display: "flex" }}>
        <div className="detail-text">{value}</div>
        {copy ? (
          <div
            className="icon"
            icon={require(`../assets/copy.svg`)}
            onClick={() => {
              copyToClipboard(value);
              toastr.success(`'${title}' a été copié dans le presse papier.`);
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default styled.div`
  background: #ffffff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
  flex: 1;
  max-width: 420px;
  min-height: 100vh;
  font-size: 14px;
  align-self: flex-start;
  position: sticky;
  top: 68px;
  right: 0;
  padding: 0px 20px 20px;
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${require("../assets/close_icon.png")}) center no-repeat;
    background-size: 12px;
    padding: 15px;
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
  }
  :hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
  }
  .title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 2px;
  }
  hr {
    margin: 20px 0 30px;
  }
  .info {
    padding: 2rem 0;
    border-bottom: 1px solid #f2f1f1;
    &-title {
      font-weight: 500;
      font-size: 18px;
      padding-right: 35px;
    }
    &-edit {
      width: 30px;
      height: 26px;
      background: url(${require("../assets/pencil.svg")}) center no-repeat;
      background-size: 16px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    padding: 5px 0;
    display: flex;
    font-size: 14px;
    text-align: left;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 10px;
    &-title {
      font-weight: bold;
      min-width: 100px;
      margin-right: 0.5rem;
    }
    &-text {
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
    .description {
      font-weight: 400;
      color: #aaa;
      font-size: 0.8rem;
    }
    .quote {
      font-size: 18px;
      font-weight: 400;
      font-style: italic;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
    width: 15px;
    height: 15px;
    background: ${`url(${require("../assets/copy.svg")})`};
    background-repeat: no-repeat;
    background-position: center;
    background-size: 15px 15px;
  }
  .application-detail {
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    margin-bottom: 0.5rem;
    text-align: left;
    :hover {
      box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
      background: #f9f9f9;
    }
    &-priority {
      font-size: 0.75rem;
      color: #5245cc;
      margin-right: 0.5rem;
    }
    &-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      display: block;
      text-overflow: ellipsis;
    }
  }
  .quote {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
  }
`;
