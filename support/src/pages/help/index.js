import { useRouter } from "next/router";
import { useEffect } from "react";

// this is to handle previous links provided by zammad

const ZammadHelp = () => {
  const router = useRouter();
  const query = router.query;

  const redirect = () => router.push("/base-de-connaissance");

  useEffect(() => {
    redirect();
  }, [query]);

  return null;
};

export default ZammadHelp;
