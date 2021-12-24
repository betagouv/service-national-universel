import useSWR, { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import API from "../../services/api";
import KnowledgeBasePublicHome from "../../components/knowledge-base/KnowledgeBasePublicHome";

const Sections = () => {
  const { user } = useUser();

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${user.restriction}` }));

  const [sections, setSections] = useState(response?.data || []);
  useEffect(() => {
    setSections(response?.data || []);
  }, [response?.data]);

  return <KnowledgeBasePublicHome item={{ children: sections }} />;
};

const AuthSections = () => {
  const { isLoading } = useUser();

  if (isLoading) return <KnowledgeBasePublicHome isLoading />;

  return <Sections />;
};

const Home = ({ fallback }) => (
  <SWRConfig value={{ fallback }}>
    <AuthSections />
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
