import useSWR, { SWRConfig } from "swr";
import Wrapper from "../../components/Wrapper";
import KnowledgeBaseCardSection from "../../components/knowledge-base/KnowledgeBaseCardSection";
import API from "../../services/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "react-loader-spinner";
import KnowledgeBaseBreadcrumb from "../../components/knowledge-base/KnowledgeBaseBreadcrumb";
import KnowledgeBaseCardArticle from "../../components/knowledge-base/KnowledgeBaseCardArticle";

const Content = () => {
  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${slug}` }));
  const [item, setItem] = useState(response?.data || {});

  useEffect(() => {
    setItem(response?.data);
  }, [response?.data]);

  if (!item) return <Loader />;

  const sections = item.children?.filter((c) => c.type === "section");
  const answers = item.children?.filter((c) => c.type === "article");

  console.log({ answers, sections });

  return (
    <>
      <div className="bg-snu-purple-900 ">
        <div className="h-full wrapper">
          <KnowledgeBaseBreadcrumb parents={item?.parents} />
          <div className="pt-24 wrapper">
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{item.title}</h1>
            <h6 className="text-snu-purple-100 max-w-3xl text-base md:text-lg lg:text-xl">{item.description}</h6>
          </div>
        </div>
      </div>
      <main className="flex h-full w-fullmax-w-screen-2xl flex-shrink overflow-y-auto">
        {!!answers?.length && (
          <section className="flex flex-col flex-grow flex-shrink-0 border-r-2 pt-12 px-12">
            <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">Sujets</h3>
            <div id="answers" className="flex flex-col h-full w-full flex-shrink overflow-y-auto">
              {answers.map(KnowledgeBaseCardArticle)}
            </div>
          </section>
        )}
        {!!sections?.length && (
          <section className="flex flex-col w-96 flex-shrink-0  pt-12 ">
            <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">Catégories</h3>
            <div id="sections" className="flex flex-wrap h-full w-full flex-shrink overflow-y-auto px-12">
              {sections.map((section) => (
                <KnowledgeBaseCardSection
                  key={section._id}
                  _id={section._id}
                  path="/admin/knowledge-base"
                  position={section.position}
                  imageSrc={section.imageSrc}
                  icon={section.icon}
                  title={section.title}
                  group={section.group}
                  createdAt={section.createdAt}
                  slug={section.slug}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

const Home = ({ fallback }) => (
  <SWRConfig value={{ fallback }}>
    <Wrapper>
      <div className="flex flex-col">
        <Content />
      </div>
      <button className="bg-white text-[#4F46E5] my-[70px] text-base shadow-base rounded-md py-3.5 px-5 mx-auto">Je n’ai pas trouvé réponse à ma question</button>
    </Wrapper>
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
