import React, { useEffect } from "react";
import PageLoader from "./PageLoader";

export default function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);

  return <PageLoader />;
}
