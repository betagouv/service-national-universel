import useSWR, { SWRConfig } from "swr";
import Wrapper from "../../components/Wrapper";
import KnowledgeBaseCardSection from "../../components/knowledge-base/KnowledgeBaseCardSection";
import API from "../../services/api";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Loader from "react-loader-spinner";
import KnowledgeBaseCardArticle from "../../components/knowledge-base/KnowledgeBaseCardArticle";
import Breadcrumb from "../../components/BreadCrumb";
import KnowledgeBaseArticle from "../../components/knowledge-base/KnowledgeBaseArticle";
import TextEditor from "../../components/TextEditor";

const Section = ({ item }) => {
  const sections = item.children?.filter((c) => c.type === "section");
  const answers = item.children?.filter((c) => c.type === "article");

  return (
    <main className="flex justify-evenly h-full w-fullmax-w-screen-2xl flex-shrink overflow-y-auto">
      {!!answers?.length && (
        <section className="flex flex-col flex-grow flex-shrink-0 pt-12 px-12 max-w-4xl">
          <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">Sujets</h3>
          <div id="answers" className="flex flex-col h-full w-full flex-shrink overflow-y-auto">
            {answers.map((answer) => (
              <KnowledgeBaseCardArticle key={answer._id} _id={answer._id} position={answer.position} title={answer.title} slug={answer.slug} path="/help" />
            ))}
          </div>
        </section>
      )}
      {!!sections?.length && (
        <section className="flex flex-col w-96 flex-shrink-0  border-l-2 pt-12 ">
          <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">Catégories</h3>
          <div id="sections" className="flex flex-wrap h-full w-full flex-shrink overflow-y-auto px-12">
            {sections.map((section) => (
              <KnowledgeBaseCardSection
                key={section._id}
                _id={section._id}
                path="/help"
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
  );
};

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

  const group = useMemo(() => {
    return item?.group || item?.parents?.[0].group;
  }, [item]);

  if (!item) return <Loader />;

  return (
    <>
      <div className="bg-snu-purple-900 ">
        <div className="h-full wrapper">
          <Breadcrumb parents={item?.parents || []} path="/help" />
          <div className="wrapper">
            {<h5 className="text-snu-purple-100 max-w-3xl pb-2 text-base md:text-lg uppercase">{group}</h5>}
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{item.title}</h1>
            <h6 className="text-snu-purple-100 text-base md:text-lg lg:text-xl">{item.description}</h6>
          </div>
        </div>
      </div>
      {item.type === "article" && (
        <div className="container bg-coolGray-100  mx-auto flex flex-col px-8 pt-3 flex-grow flex-shrink overflow-hidden w-full">
          <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
        </div>
      )}
      {item.type === "section" && <Section item={item} />}
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
