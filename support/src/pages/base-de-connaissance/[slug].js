import { useEffect, useState } from "react";
import useSWR, { SWRConfig } from "swr";
import API from "../../services/api";
import { useRouter } from "next/router";
import PublicKBContent from "../../components/knowledge-base/PublicKBContent";

const Content = () => {
  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const user = {}; // find the user in some way, with the cookie ?

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${!user ? "public" : user.role ? "referent" : "young"}/${slug}` }));
  const [item, setItem] = useState(response?.data || {});

  useEffect(() => {
    setItem(response?.data);
  }, [response?.data]);

  return <PublicKBContent item={item} />;
};

const Home = ({ fallback }) => (
  <SWRConfig value={{ fallback }}>
    <Content />
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
  const response = await API.getasync({ path: `/support-center/knowledge-base/${params.slug}` });

  // Pass post data to the page via props
  return {
    props: {
      fallback: {
        [`/support-center/knowledge-base/${params.slug}`]: response,
      },
    }, // will be passed to the page component as props
  };
}
