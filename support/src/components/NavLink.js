import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const getActiveClassName = (pathname, href, exact) => {
  if (exact) {
    if (pathname === href) return "font-bold stroke-2";
    return "";
  }
  if (pathname.includes(href)) return "font-bold stroke-2";
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
      <li className={`px-4 py-4 text-sm cursor-pointer  flex flex-nowrap ${activeClassName} ${className}`}>{children}</li>
    </Link>
  );
};

export default NavLink;
