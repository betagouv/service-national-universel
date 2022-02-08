import useSWR, { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import API from "../../services/api";
import KnowledgeBasePublicHome from "../../components/knowledge-base/KnowledgeBasePublicHome";
import Head from "next/head";

const PopulatedHome = () => {
  const { restriction } = useUser();

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
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#32257F" />
      <meta name="description" content="Service National Universel | Base de connaissance" />
      <meta property="og:title" key="og:title" content="Service National Universel | Base de connaissance" />
      <meta property="og:url" key="og:url" content="https://support.snu.gouv.fr/base-de-connaissance/" />
      <meta rel="canonical" key="canonical" content="https://support.snu.gouv.fr/base-de-connaissance/" />
      <meta property="og:description" content="Service National Universel | Base de connaissance" />

      <meta property="og:image" key="og:image" content="https://support.snu.gouv.fr/assets/og-image.png" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" key="og:image:alt" content="Service National Universel | Base de connaissance" />
      <meta property="og:type" content="article" />
    </Head>
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
