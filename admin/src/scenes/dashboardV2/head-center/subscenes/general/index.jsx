import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import General from "../../../components/General";
import InfoMessage from "../../../components/ui/InfoMessage";
import Todos from "../../../components/Todos";
import { useSelector } from "react-redux";

export default function Index() {
  return <General />;
}
