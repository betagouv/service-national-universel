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
  [ROLES.ADMINISTRATEUR_CLE]: {
    authorised: ["/mon-etablissement", "/classes", "/mes-eleves", "/user", "/profil", "/volontaire", "/besoin-d-aide", "/accueil"],
    default: "/accueil",
  },
  [ROLES.REFERENT_CLASSE]: {
    authorised: ["/mon-etablissement", "/classes", "/mes-eleves", "/user", "/profil", "/volontaire", "/besoin-d-aide", "/accueil"],
    default: "/accueil",
  },
  [ROLES.VISITOR]: { authorised: ["/dashboard", "/school", "/profil", "/besoin-d-aide"], default: "/dashboard" },
  [ROLES.HEAD_CENTER]: {
    authorised: ["/dashboard", "/profil", "/volontaire", "/ligne-de-bus", "/besoin-d-aide", "/centre", "/point-de-rassemblement", "/contenu", "/user"],
    default: "/dashboard",
  },
  [ROLES.RESPONSIBLE]: { authorised: ["/dashboard", "/profil", "/volontaire", "/structure", "/mission", "/besoin-d-aide", "/user"], default: "/dashboard" },
  [ROLES.SUPERVISOR]: { authorised: ["/dashboard", "/profil", "/volontaire", "/structure", "/mission", "/besoin-d-aide", "/user"], default: "/dashboard" },
};

const PERMISSIONS_BY_ROUTE = {
  "/injep-export": [{ resource: PERMISSION_RESOURCES.EXPORT_INJEP, action: PERMISSION_ACTIONS.EXECUTE }],
  "/dsnj-export": [{ resource: PERMISSION_RESOURCES.EXPORT_DSNJ, action: PERMISSION_ACTIONS.EXECUTE }],
  "/profil": [{ resource: PERMISSION_RESOURCES.REFERENT, action: PERMISSION_ACTIONS.READ }],
  "/besoin-d-aide": [{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE }],
  "/dashboard": [{ resource: PERMISSION_RESOURCES.DASHBOARD, action: PERMISSION_ACTIONS.READ }],
};

const DEFAULT_ROUTE_BY_ROLE = {
  [ROLES.INJEP]: "/injep-export",
  [ROLES.DSNJ]: "/dsnj-export",
};

export const RestrictedRoute = ({ component: Component, roles = ROLES_LIST, ...rest }) => {
  const { pathname } = useLocation();
  const user = useSelector((state: AuthState) => state.Auth.user);
  const defaultRoute = DEFAULT_ROUTE_BY_ROLE[user.role] || "/dashboard";

  if (!roles.includes(user.role)) {
    return <Redirect to={defaultRoute} />;
  }

  // TODO: remove legacy matchRoute
  const matchRoute = limitedAccess[user.role]?.authorised.some((route) => pathname.includes(route));
  if (limitedAccess[user.role] && !matchRoute) {
    return <Redirect to={limitedAccess[user.role].default} />;
  }

  const route = Object.keys(PERMISSIONS_BY_ROUTE).find((route) => pathname.startsWith(route));
  if (!matchRoute && route && PERMISSIONS_BY_ROUTE[route]) {
    const routeAuthorized = PERMISSIONS_BY_ROUTE[route].some((permission) => isAuthorized({ user, resource: permission.resource, action: permission.action }));
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
        // toastr.error("Accès non autorisé", `Vous n'avez pas les permissions nécessaires pour accéder à cette page, vous avez été redirigé vers l'accueil.`);
      }
      return <Redirect to={defaultRoute} />;
    } else {
      console.debug(`user has permission for ${pathname}`);
    }
  }

  // TODO: remove this hack when all routes are protected with permissions
  if (!matchRoute && (!route || !PERMISSIONS_BY_ROUTE[route]) && [ROLES.INJEP, ROLES.DSNJ].includes(user.role)) {
    console.log(`user does not have permission for ${pathname}.`);
    if (pathname !== defaultRoute) {
      toastr.error("Accès non autorisé", `Vous n'avez pas les permissions nécessaires pour accéder à cette page, vous avez été redirigé vers l'accueil.`);
    }
    return <Redirect to={defaultRoute} />;
  }

  return <SentryRoute {...rest} render={(props) => <Component {...props} />} />;
};
