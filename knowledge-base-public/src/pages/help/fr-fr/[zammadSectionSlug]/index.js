import { useRouter } from "next/router";
import { useEffect } from "react";
import useUser from "../../../../hooks/useUser";
import API from "../../../../services/api";

// this is to handle previous links provided by zammad

const ZammadHelp = () => {
  const router = useRouter();
  const query = router.query;
  const { restriction } = useUser();

  const redirect = async () => {
    if (!Object.keys(query).length) return;
    if (!router?.query?.zammadSectionSlug) return router.push("/base-de-connaissance");
    const zammadId = router?.query?.zammadSectionSlug?.split("-")?.[0];
    if (!zammadId) return router.push("/base-de-connaissance");
    const response = await API.get({ path: `/knowledge-base/${restriction}/zammad-id/${zammadId}`, query: { type: "section" } });
    if (!response.ok || !response?.data?.slug) return router.push("/base-de-connaissance");
    return router.push(`/base-de-connaissance/${response.data.slug}`);
  };

  useEffect(() => {
    redirect();
  }, [query]);

  return null;
};

export default ZammadHelp;
