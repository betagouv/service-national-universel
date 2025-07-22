import React, { useState } from "react";
import { Link, Switch } from "react-router-dom";

import { useSelector } from "react-redux";
import Folder from "./folder";
import Macro from "./macro";
import Shortcut from "./shortcut";
import Tag from "./tag";
import Spam from "./spam";
import Signature from "./signature";

import VentilationAutomation from "./ventilationAutomation";

import { classNames } from "../../utils";

import { HiOutlineCollection, HiOutlineTicket } from "react-icons/hi";
import KnowledgeBaseRoles from "./knowledgeBaseRoles";
import KnowledgeBaseUrl from "./knowledgeBaseUrl";
import KnowledgeBaseSearch from "./knowledgeBaseSearch";
import { SentryRoute } from "../../sentry";
import Template from "./template";

export default () => {
  const [active, setActive] = useState(null);
  const { user } = useSelector((state) => state.Auth);

  return (
    <div className="relative flex flex-1 overflow-hidden">
      <div className="flex w-[276px] flex-none flex-col gap-[28px] overflow-y-auto bg-white py-7">
        {user.role === "AGENT" ? (
          <SideMenuItem
            name="Tickets"
            icon={<HiOutlineTicket />}
            lists={[
              { url: "ventilation", name: "Ventilation", isVisible: true },
              { url: "macro", name: "Macros", isVisible: true },
              { url: "template", name: "Modèles de tickets", isVisible: true },
              { url: "tag", name: "Etiquettes", isVisible: true },
              { url: "shortcut", name: "Modules de textes", isVisible: true },
              { url: "folder", name: "Gestion des dossiers", isVisible: true },
              { url: "spam", name: "Gestion des spams", isVisible: true },
              { url: "signature", name: "Signatures", isVisible: true },
            ]}
            active={active}
            setActive={setActive}
          />
        ) : (
          <SideMenuItem
            name="Messages"
            icon={<HiOutlineTicket />}
            lists={[{ url: "folder", name: "Gestion des dossiers", isVisible: true }]}
            active={active}
            setActive={setActive}
          />
        )}

        {user.role === "AGENT" && (
          <SideMenuItem
            name="Base de connaissance"
            icon={<HiOutlineCollection />}
            lists={[
              { url: "kb-roles", name: "Rôles", isVisible: true },
              { url: "kb-url", name: "URL", isVisible: true },
              { url: "kb-search", name: "Recherches", isVisible: true },
            ]}
            active={active}
            setActive={setActive}
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-[38px] pl-[34px] pr-10">
        <div className="flex-1 overflow-y-auto py-[38px] pl-[34px] pr-10">
          <Switch>
            {user.role === "AGENT" && <SentryRoute path="/setting/macro" component={Macro} />}
            {user.role === "AGENT" && <SentryRoute path="/setting/template" component={Template} />}
            <SentryRoute path="/setting/folder" component={Folder} />
            {user.role === "AGENT" && <SentryRoute path="/setting/shortcut" component={Shortcut} />}
            {user.role === "AGENT" && <SentryRoute path="/setting/ventilation" component={VentilationAutomation} />}
            {user.role === "AGENT" && <SentryRoute path="/setting/tag" component={Tag} />}
            {user.role === "AGENT" && <SentryRoute path="/setting/spam" component={Spam} />}
            {user.role === "AGENT" && <SentryRoute path="/setting/signature" component={Signature} />}

            <SentryRoute path="/setting/" component={Folder} exact />
            {user.role === "AGENT" && <SentryRoute path="/setting/kb-url" component={KnowledgeBaseUrl} exact />}
            {user.role === "AGENT" && <SentryRoute path="/setting/kb-roles" component={KnowledgeBaseRoles} exact />}
            {user.role === "AGENT" && <SentryRoute path="/setting/kb-search" component={KnowledgeBaseSearch} exact />}
          </Switch>
        </div>
      </div>
    </div>
  );
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
              to={`/setting/${list.url}`}
              className="flex cursor-pointer items-center justify-between gap-2 bg-white p-3 transition-colors hover:bg-gray-50"
              onClick={() => setActive(list.url)}
              key={index}
            >
              <span className={classNames(active === list.id ? "font-bold text-accent-color" : "font-medium text-gray-900", "text-left text-base")}>{list.name}</span>
            </Link>
          ))}
      </div>
    </div>
  );
};
