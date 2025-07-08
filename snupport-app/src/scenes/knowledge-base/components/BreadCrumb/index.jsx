import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";

const Breadcrumb = ({ parents, path }) => {
  return (
    <div id="breadcrumb" className="w-full shrink-0 bg-snu-purple-900 text-sm font-normal print:hidden">
      <ul>
        <Crumb href={path} className="root">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Crumb>
        {parents.map(({ _id, slug, title }, index) => (
          <Crumb key={_id} href={`${path}/${slug}`} index={index}>
            {title}
          </Crumb>
        ))}
      </ul>
    </div>
  );
};

const Crumb = ({ href, children, index }) => (
  <>
    <Link to={href} style={{ marginLeft: `${index + 0.5}rem` }} id="mobile" className="cursor-pointer">
      {children}
    </Link>
    <Link to={href} id="desktop" className="cursor-pointer">
      {children}
    </Link>
  </>
);

export default Breadcrumb;
