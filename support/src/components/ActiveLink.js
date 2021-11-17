import Link from "next/link";
import { useRouter } from "next/router";

const NavLink = ({ href, children }) => {
  const router = useRouter();
  return (
    <Link href={href} passHref>
      <li className={` hover:bg-snu-purple-600 px-6 py-4 cursor-pointer ${router.pathname == href ? "bg-snu-purple-300" : ""}`}>{children}</li>
    </Link>
  );
};

export default NavLink;
