import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import useUser from "../hooks/useUser";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user, isLoading } = useUser({ redirectOnLoggedOut: "/admin/auth" });
    // to prevent this kind of errors: `Warning: Expected server HTML to contain a matching <div> in <div>.`
    // https://github.com/vercel/next.js/discussions/17443#discussioncomment-87097
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    // if (!isMounted) return null;

    if (isLoading) return <Loader />;
    if (!user.isLoggedIn) return null;

    return <WrappedComponent user={user} {...props} />;
  };
};

export default withAuth;
