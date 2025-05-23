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
  // [ROLES.RESPONSIBLE]: { authorised: ["/dashboard", "/profil", "/volontaire", "/structure", "/mission", "/besoin-d-aide", "/user"], default: "/dashboard" },
  [ROLES.SUPERVISOR]: { authorised: ["/dashboard", "/profil", "/volontaire", "/structure", "/mission", "/besoin-d-aide", "/user"], default: "/dashboard" },
};

const PERMISSIONS_BY_ROUTE = {
  "/injep-export": {
    permissions: [{ resource: PERMISSION_RESOURCES.EXPORT_INJEP, action: PERMISSION_ACTIONS.EXECUTE }],
  },
  "/dsnj-export": {
    permissions: [{ resource: PERMISSION_RESOURCES.EXPORT_DSNJ, action: PERMISSION_ACTIONS.EXECUTE }],
  },
  "/profil": {
    permissions: [{ resource: PERMISSION_RESOURCES.REFERENT, action: PERMISSION_ACTIONS.READ }],
  },
  "/besoin-d-aide": {
    permissions: [{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE }],
  },
  "/dashboard": {
    permissions: [{ resource: PERMISSION_RESOURCES.DASHBOARD, action: PERMISSION_ACTIONS.READ }],
  },
  "/mission": {
    ignorePolicy: true, // should have read permission but not specific to a mission
    permissions: [{ resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.READ }],
  },
  "/structure/": {
    params: { id: "structure._id" },
    permissions: [{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ }],
  },
  "/association": {
    permissions: [{ resource: PERMISSION_RESOURCES.ASSOCIATION, action: PERMISSION_ACTIONS.READ }],
  },
  "/contenu": {
    permissions: [{ resource: PERMISSION_RESOURCES.PROGRAM, action: PERMISSION_ACTIONS.READ }],
  },
  "/school": {
    permissions: [{ resource: PERMISSION_RESOURCES.ETABLISSEMENT, action: PERMISSION_ACTIONS.READ }],
  },
  "/etablissement": {
    permissions: [{ resource: PERMISSION_RESOURCES.ETABLISSEMENT, action: PERMISSION_ACTIONS.READ }],
  },
  "/point-de-rassemblement": {
    permissions: [{ resource: PERMISSION_RESOURCES.POINT_DE_RASSEMBLEMENT, action: PERMISSION_ACTIONS.READ }],
  },
  "/ligne-de-bus": {
    permissions: [{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ }],
  },
  "/volontaire/create": {
    permissions: [{ resource: PERMISSION_RESOURCES.YOUNG, action: PERMISSION_ACTIONS.CREATE }],
  },
  "/volontaire": {
    ignorePolicy: true, // should have read permission but not specific to a young
    permissions: [{ resource: PERMISSION_RESOURCES.YOUNG, action: PERMISSION_ACTIONS.READ }],
  },
  "/inscription": {
    ignorePolicy: true, // should have read permission but not specific to a young
    permissions: [{ resource: PERMISSION_RESOURCES.YOUNG, action: PERMISSION_ACTIONS.READ }],
  },
  "/alerte": {
    permissions: [{ resource: PERMISSION_RESOURCES.ALERTE_MESSAGE, action: PERMISSION_ACTIONS.WRITE }],
  },
  "/settings": {
    permissions: [
      { resource: PERMISSION_RESOURCES.COHORT, action: PERMISSION_ACTIONS.EXECUTE },
      { resource: PERMISSION_RESOURCES.COHORT, action: PERMISSION_ACTIONS.WRITE },
    ],
  },
  "/user": {
    ignorePolicy: true, // should have write permission but not specific to a referent
    permissions: [{ resource: PERMISSION_RESOURCES.REFERENT, action: PERMISSION_ACTIONS.WRITE }],
  },
  "/user/": {
    params: { id: "referent._id" },
    permissions: [{ resource: PERMISSION_RESOURCES.REFERENT, action: PERMISSION_ACTIONS.WRITE }],
  },
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
  if (!matchRoute && route && PERMISSIONS_BY_ROUTE[route]?.permissions) {
    const id = pathname.match(/[0-9a-fA-F]{24}/)?.[0];
    const context = {};
    if (id && PERMISSIONS_BY_ROUTE[route].params?.id) {
      setAttributeFromPath(PERMISSIONS_BY_ROUTE[route].params.id, context, id);
    }
    const routeAuthorized = PERMISSIONS_BY_ROUTE[route].permissions.some((permission) =>
      isAuthorized({ user, resource: permission.resource, action: permission.action, context, ignorePolicy: PERMISSIONS_BY_ROUTE[route].ignorePolicy }),
    );
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

const setAttributeFromPath = (path: string, obj: object, value: string) => {
  const pathParts = path.split(".");
  let current = obj;
  pathParts.forEach((part, index) => {
    if (index < pathParts.length - 1) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    } else {
      current[part] = value;
    }
  });
};
