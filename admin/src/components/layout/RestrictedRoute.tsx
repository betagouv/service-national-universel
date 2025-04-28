import React from "react";
import { useSelector } from "react-redux";
import { Redirect, useLocation } from "react-router-dom";
import { BsLock } from "react-icons/bs";
import { toastr } from "react-redux-toastr";

import { ROLES, ROLES_LIST, PERMISSION_RESOURCES, PERMISSION_ACTIONS, isAuthorized } from "snu-lib";

import { AuthState } from "../../redux/auth/reducer";
import { SentryRoute } from "../../sentry";

import GenericError from "./GenericError";

// legacy
const limitedAccess = {
  [ROLES.TRANSPORTER]: { authorised: ["/schema-repartition", "/profil", "/ligne-de-bus", "/centre", "/point-de-rassemblement", "/besoin-d-aide"], default: "/schema-repartition" },
  // FIXME [CLE]: remove dev routes when
  [ROLES.ADMINISTRATEUR_CLE]: {
    authorised: ["/mon-etablissement", "/classes", "/mes-eleves", "/design-system", "/develop-assets", "/user", "/profil", "/volontaire", "/besoin-d-aide", "/accueil"],
    default: "/accueil",
  },
  [ROLES.REFERENT_CLASSE]: {
    authorised: ["/mon-etablissement", "/classes", "/mes-eleves", "/design-system", "/develop-assets", "/user", "/profil", "/volontaire", "/besoin-d-aide", "/accueil"],
    default: "/accueil",
  },
  [ROLES.VISITOR]: { authorised: ["/dashboard", "/school", "/profil", "/besoin-d-aide"], default: "/dashboard" },
};

const PERMISSIONS_BY_ROUTE = {
  "/injep-export": [{ ressource: PERMISSION_RESOURCES.EXPORT_INJEP, action: PERMISSION_ACTIONS.EXECUTE }],
  "/dsnj-export": [{ ressource: PERMISSION_RESOURCES.EXPORT_DSNJ, action: PERMISSION_ACTIONS.EXECUTE }],
  "/profil": [{ ressource: PERMISSION_RESOURCES.REFERENT, action: PERMISSION_ACTIONS.READ }],
  "/besoin-d-aide": [{ ressource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE }],
};

const DEFAULT_ROUTE_BY_ROLE = {
  [ROLES.INJEP]: "/injep-export",
  [ROLES.DSNJ]: "/dsnj-export",
};

export const RestrictedRoute = ({ component: Component, roles = ROLES_LIST, ...rest }) => {
  const { pathname } = useLocation();
  const user = useSelector((state: AuthState) => state.Auth.user);
  const defaultRoute = DEFAULT_ROUTE_BY_ROLE[user.role] || "/";

  if (!roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  // TODO: remove legacy matchRoute
  const matchRoute = limitedAccess[user.role]?.authorised.some((route) => pathname.includes(route));
  if (limitedAccess[user.role] && !matchRoute) {
    return <Redirect to={limitedAccess[user.role].default} />;
  }

  if (!matchRoute && PERMISSIONS_BY_ROUTE[pathname]) {
    const routeAuthorized = PERMISSIONS_BY_ROUTE[pathname].some((permission) => isAuthorized({ user, ressource: permission.ressource, action: permission.action }));
    if (!routeAuthorized) {
      console.log(`user does not have permission for ${pathname}`);
      if (pathname === defaultRoute) {
        return (
          <GenericError
            icon={<BsLock className="w-16 h-16 text-ds-gray-900" />}
            title="Accès non autorisé"
            details="Vous n'avez pas les permissions nécessaires pour accéder à cette page"
            error={null}
            componentStack={null}
          />
        );
      } else {
        toastr.error("Accès non autorisé", `Vous n'avez pas les permissions nécessaires pour accéder à cette page, vous avez été redirigé vers l'accueil.`);
      }
      return <Redirect to={defaultRoute} />;
    } else {
      console.debug(`user has permission for ${pathname}`);
    }
  }

  // TODO: remove this hack when all routes are protected with permissions
  if (!matchRoute && !PERMISSIONS_BY_ROUTE[pathname] && [ROLES.INJEP, ROLES.DSNJ].includes(user.role)) {
    console.log(`user does not have permission for ${pathname}.`);
    if (pathname !== defaultRoute) {
      toastr.error("Accès non autorisé", `Vous n'avez pas les permissions nécessaires pour accéder à cette page, vous avez été redirigé vers l'accueil.`);
    }
    return <Redirect to={defaultRoute} />;
  }

  return <SentryRoute {...rest} render={(props) => <Component {...props} />} />;
};
