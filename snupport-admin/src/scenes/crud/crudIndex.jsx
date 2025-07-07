import React, { useState } from "react";
import { Link, Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiOutlineUserAdd } from "react-icons/hi";
import { CreateAgent } from "./createAgent";
import { DeleteAgent } from "./deleteAgent";

export default () => {
  const [active, setActive] = useState("create");
  const userRole = useSelector((state) => state.Auth.user.role);

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div className="flex w-[276px] flex-none flex-col gap-[28px] overflow-y-auto bg-white py-7">
        <SideMenuItem
          name="Agents"
          icon={<HiOutlineUserAdd />}
          lists={[
            { url: "create", name: "Créer Agent", isVisible: true },
            { url: "delete", name: "Supprimer Agent", isVisible: true },
          ]}
          active={active}
          setActive={setActive}
        />
      </div>

      <div className="flex-1 overflow-y-auto py-[38px] pl-[34px] pr-10">
        <Switch>
          <RestrictedRoute path="/agents/create" component={CreateAgent} requiredRole="AGENT" userRole={userRole} />
          <RestrictedRoute path="/agents/delete" component={DeleteAgent} requiredRole="AGENT" userRole={userRole} />
          <Redirect from="/agents" to="/agents/create" />
        </Switch>
      </div>
    </div>
  );
};

const RestrictedRoute = ({ component: Component, requiredRole, userRole, ...rest }) => {
  return <Route {...rest} render={(props) => (userRole === requiredRole ? <Component {...props} /> : <Redirect to="/" />)} />;
};

const SideMenuItem = ({ name, icon, lists, active, setActive }) => {
  return (
    <div>
      <div className="ml-6 mb-1 flex items-center gap-2">
        <span className="text-2xl text-gray-400">{icon}</span>
        <span className="text-sm font-medium uppercase text-gray-500">{name}</span>
      </div>
      <div className="ml-14 flex flex-col divide-y divide-gray-300/50">
        {lists
          .filter((list) => list.isVisible)
          .map((list, index) => (
            <Link
              to={`/agents/${list.url}`}
              className="flex cursor-pointer items-center justify-between gap-2 bg-white p-3 transition-colors hover:bg-gray-50"
              onClick={() => setActive(list.url)}
              key={index}
            >
              <span className={active === list.url ? "font-bold text-accent-color" : "font-medium text-gray-900"}>{list.name}</span>
            </Link>
          ))}
      </div>
    </div>
  );
};
