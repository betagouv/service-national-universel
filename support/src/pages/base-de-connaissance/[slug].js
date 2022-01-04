import { useEffect, useMemo } from "react";
import useSWR from "swr";
import API from "../../services/api";
import { useRouter } from "next/router";
import KnowledgeBasePublicContent from "../../components/knowledge-base/KnowledgeBasePublicContent";
import useUser from "../../hooks/useUser";

const Content = () => {
  const router = useRouter();
  const slug = useMemo(() => router.query?.slug || "", [router.query?.slug]);

  const { user } = useUser();

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${user.restriction}/${slug}` }));
  const item = useMemo(() => response?.data || {}, [response?.data]);

  useEffect(() => {
    if (response?.code === "NOT_FOUND") {
      router.replace("/base-de-connaissance");
    }
  }, [response?.code]);

  return <KnowledgeBasePublicContent item={item} />;
};

const AuthContent = () => {
  const { isLoading } = useUser();

  if (isLoading) return <KnowledgeBasePublicContent isLoading />;

  return <Content />;
};

const Home = () => <AuthContent />;

export default Home;
