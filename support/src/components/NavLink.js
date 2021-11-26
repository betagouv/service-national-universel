import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const getActiveClassName = (pathname, href, exact) => {
  if (exact) {
    if (pathname === href) return "bg-snu-purple-300";
    return "";
  }
  if (pathname.includes(href)) return "bg-snu-purple-300";
  return "";
};

const NavLink = ({ href, children, exact = false, className = "" }) => {
  const router = useRouter();
  const [activeClassName, setActiveClassName] = useState(false);
  useEffect(() => {
    setActiveClassName(getActiveClassName(router?.pathname, href, exact));
  }, [router?.pathname]);

  return (
    <Link href={href} passHref>
      <li className={`hover:bg-snu-purple-600 px-6 py-4 cursor-pointer ${activeClassName} ${className}`}>{children}</li>
    </Link>
  );
};

export default NavLink;
