import { reducer as toastr } from "react-redux-toastr";

import Auth from "./auth/reducer";
import Tickets from "./tickets/reducer";
import Cohorts from "./cohorts/reducer";

export default { Auth, Tickets, Cohorts, toastr };
