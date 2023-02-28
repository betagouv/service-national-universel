import React from "react";
import { Row } from "reactstrap";

const FormRow = ({ align = "flex-start", children }) => {
  return (
    <Row style={{ alignItems: align }} className="border-t-[1px] border-gray-200 py-5 text-left mb-10 [&_input[type=text]]:max-w-[500px]">
      {children}
    </Row>
  );
};

export default FormRow;
