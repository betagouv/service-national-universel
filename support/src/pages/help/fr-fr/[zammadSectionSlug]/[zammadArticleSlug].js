import { useRouter } from "next/router";
import { useEffect } from "react";
import useUser from "../../../../hooks/useUser";
import API from "../../../../services/api";

// this is to handle previous links provided by zammad

const ZammadHelp = () => {
  const router = useRouter();
  const query = router.query;
  const { user } = useUser();

  const redirect = async () => {
    if (!Object.keys(query).length) return;
    if (!router?.query?.zammadArticleSlug) return router.push("/base-de-connaissance");
    const zammadId = router?.query?.zammadArticleSlug?.split("-")?.[0];
    if (!zammadId) return router.push("/base-de-connaissance");
    const response = await API.getasync({ path: `/support-center/knowledge-base/${user.restriction}/zammad-id/${zammadId}`, query: { type: "article" } });
    if (!response.ok || !response?.data?.slug) return router.push("/base-de-connaissance");
    return router.push(`/base-de-connaissance/${response.data.slug}`);
  };

  useEffect(() => {
    redirect();
  }, [query]);

  return null;
};

export default ZammadHelp;
