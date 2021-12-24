import { useEffect, useState } from "react";
import useSWR, { SWRConfig } from "swr";
import API from "../../services/api";
import { useRouter } from "next/router";
import KnowledgeBasePublicContent from "../../components/knowledge-base/KnowledgeBasePublicContent";
import useUser from "../../hooks/useUser";

const Content = () => {
  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const { user } = useUser();

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${user.restriction}/${slug}` }));
  const [item, setItem] = useState(response?.data || {});

  useEffect(() => {
    setItem(response?.data);
  }, [response?.data]);

  return <KnowledgeBasePublicContent item={item} />;
};

const AuthContent = () => {
  const { isLoading } = useUser();

  if (isLoading) return <KnowledgeBasePublicContent isLoading />;

  return <Content />;
};

const Home = ({ fallback }) => (
  <SWRConfig value={{ fallback }}>
    <AuthContent />
  </SWRConfig>
);

export default Home;

export async function getStaticPaths() {
  const response = await API.getasync({ path: "/support-center/knowledge-base/all-slugs" });
  return {
    // Only `/posts/1` and `/posts/2` are generated at build time
    paths: response.data.map((slug) => ({ params: { slug } })),
    // Enable statically generating additional pages
    // For example: `/posts/3`
    fallback: false,
  };
}

// This also gets called at build time
export async function getStaticProps({ params }) {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const response = await API.getasync({ path: `/support-center/knowledge-base/public/${params.slug}` });

  // Pass post data to the page via props
  return {
    props: {
      fallback: {
        [`/support-center/knowledge-base/public/${params.slug}`]: response,
      },
    }, // will be passed to the page component as props
  };
}
