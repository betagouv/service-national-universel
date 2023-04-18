import React from "react";

const ErrorMessage = ({ error = null }) => error && <p className="text-red-500 text-sm px-3 pt-1">{error}</p>;

export default ErrorMessage;
