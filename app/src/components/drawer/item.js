import React from "react";
import { NavLink } from "react-router-dom";

export default ({ title, subtitle, to, status, handleClick, disabled, children, open }) => (
  <li>
    <NavLink to={to} onClick={handleClick} className={disabled ? "disabled" : ""}>
      <div className="icon">
        <svg fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          ></path>
        </svg>
      </div>
      <div>
        {title}
        <span>
          {subtitle} • {status}
        </span>
      </div>
    </NavLink>
    {open ? children : null}
  </li>
);
