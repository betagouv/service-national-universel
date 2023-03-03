import React from "react";
import { Row } from "reactstrap";

const FormRow = ({ align = "flex-start", margin = "40px 0 0 0", children }) => {
  return (
    <Row style={{ alignItems: align, margin }} className="border-t-[1px] border-gray-200 py-5 text-left [&_input[type=text]]:max-w-[500px]">
      {children}
    </Row>
  );
};

export default FormRow;
