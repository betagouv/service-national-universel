import React from "react";
import { Col, Row } from "reactstrap";

export default ({ title, name, value, handleChange, disabled, options, required = false, placeholder = "" }) => {
  const renderSelect = () => (
    <select disabled={disabled} className="form-control" name={name} value={value} onChange={handleChange} validate={(v) => required && !v && requiredMessage}>
      <option key={-1} value="" label={placeholder}>
        {placeholder}
      </option>
      {options.map((o, i) => (
        <option key={i} value={o.value} label={o.label}>
          {o.label}
        </option>
      ))}
    </select>
  );

  return (
    <Row className="detail">
      {title ? (
        <>
          <Col md={4}>
            <label>{title}</label>
          </Col>
          <Col md={8}>{renderSelect()}</Col>
        </>
      ) : (
        <Col md={12}>{renderSelect()}</Col>
      )}
    </Row>
  );
};
