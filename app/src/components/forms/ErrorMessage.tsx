import React from "react";

const ErrorMessage = ({ error }) => error && <p className="pt-1 text-sm text-red-500">{error}</p>;

export default ErrorMessage;
