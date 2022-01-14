import useSWR, { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import API from "../../services/api";
import KnowledgeBasePublicHome from "../../components/knowledge-base/KnowledgeBasePublicHome";

const PopulatedHome = () => {
  const { restriction } = useUser();

  console.log({ restriction });

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${restriction}` }));

  const [sections, setSections] = useState(response?.data || []);
  useEffect(() => {
    setSections(response?.data || []);
  }, [response?.data]);

  return <KnowledgeBasePublicHome item={{ children: sections }} isLoading={!sections?.length} />;
};

const AuthHome = () => {
  const { isLoading, restriction } = useUser();

  if (isLoading) return <KnowledgeBasePublicHome isLoading />;

  return <PopulatedHome key={restriction} />;
};

const Home = ({ fallback }) => (
  <SWRConfig value={{ fallback }}>
    <AuthHome />
  </SWRConfig>
);

export default Home;

// https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data
export async function getStaticProps() {
  const response = await API.getasync({ path: "/support-center/knowledge-base/public" });
  return {
    props: {
      fallback: {
        "/support-center/knowledge-base/public": response,
      },
    }, // will be passed to the page component as props
  };
}
