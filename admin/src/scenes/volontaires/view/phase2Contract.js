import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { useHistory } from "react-router-dom";

import { translate as t, YOUNG_PHASE, YOUNG_STATUS_PHASE2, APPLICATION_STATUS, APPLICATION_STATUS_COLORS, dateForDatePicker, getAge } from "../../../utils";
import api from "../../../services/api";
import WrapperPhase2 from "./wrapper";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import Loader from "../../../components/Loader";
import { Box } from "../../../components/box";
import VioletHeaderButton from "../../../components/buttons/VioletHeaderButton";
import WhiteHeaderButton from "../../../components/buttons/WhiteHeaderButton";
import DownloadContractButton from "../../../components/buttons/DownloadContractButton";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";
import Badge from "../../../components/Badge";
import Contract from "../../../components/Contract";
import Wrapper from "./wrapper";

export default ({ young }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <Wrapper young={young} tab="phase2">
        <Contract young={young} admin={true} />;
      </Wrapper>
    </div>
  );
};
