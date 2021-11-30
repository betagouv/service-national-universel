import React from "react";
import { Spinner, Button } from "reactstrap";

const LoadingButton = ({ loading, children, disabled, ...rest }) => (
  <Button
    {...rest}
    disabled={loading || disabled}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: loading ? 0.7 : 1,
      cursor: loading ? "not-allowed" : "pointer",
    }}>
    {loading && <Spinner size="sm" style={{ borderWidth: "0.1em" }} />}
    {!loading && children}
  </Button>
);

export default LoadingButton;
