import { reducer as toastr } from "react-redux-toastr";

import Auth from "./auth/reducer";
import Tickets from "./tickets";
import Cohorts from "./cohorts";

export default { Auth, Tickets, Cohorts, toastr };
