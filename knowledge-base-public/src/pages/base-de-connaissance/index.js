import useSWR, { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import API from "../../services/api";
import KnowledgeBasePublicHome from "../../components/knowledge-base/KnowledgeBasePublicHome";
import Head from "next/head";

/*
Why this shitty PublicHome ? Because of Next.js I must say...
On first render, restriction is `null|undefined`
Therefore, the code below woudln't work
```
const { data: response } = useSWR(API.getUrl({ path: `/knowledge-base/${restriction}` }))
```
*/

const PublicHome = () => {
  const { restriction } = useUser();

  const { data: response } = useSWR(API.getUrl({ path: `/knowledge-base/${restriction}` }));

  const [sections, setSections] = useState(response?.data || []);
  useEffect(() => {
    setSections(response?.data || []);
  }, [response?.data]);

  return <KnowledgeBasePublicHome item={{ children: sections }} isLoading={!sections?.length} />;
};

const Home = ({ fallback }) => {
  const { isLoading, restriction } = useUser();

  if (isLoading) return <KnowledgeBasePublicHome isLoading />;
  return (
    <SWRConfig value={{ fallback }}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
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
      {isLoading ? <KnowledgeBasePublicHome isLoading /> : <PublicHome key={restriction} />}
    </SWRConfig>
  );
};

export default Home;

// https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data
export async function getStaticProps() {
  const response = await API.get({ path: "/knowledge-base/public" });
  return {
    props: {
      fallback: {
        "/knowledge-base/public": response,
      },
    }, // will be passed to the page component as props
  };
}
