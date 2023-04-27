import React from "react";

const ErrorMessage = ({ error = null }) => error && <p className="px-3 pt-1 text-sm text-red-500">{error}</p>;

export default ErrorMessage;
