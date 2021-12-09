import useSWR, { SWRConfig } from "swr";
import Wrapper from "../../components/Wrapper";
import KnowledgeBaseCardSection from "../../components/knowledge-base/KnowledgeBaseCardSection";
import API from "../../services/api";
import { useEffect, useState } from "react";

const Sections = () => {
  const { data: response } = useSWR(API.getUrl({ path: "/support-center/knowledge-base" }));

  const [sections, setSections] = useState(response?.data || []);
  useEffect(() => {
    setSections(response?.data || []);
  }, response?.data);

  return (
    <div className="md:px-10 px-6 flex lg:flex flex-col lg:flex-nowrap overflow-hidden max-w-screen-95 mx-auto flex-wrap grid-cols-2 md:grid md:flex-row row-span-2 row-start-2 col-span-full gap-2.5 h-84">
      {sections.map((section) => (
        <KnowledgeBaseCardSection key={section._id} title={section.title} group={section.group} imageSrc={section.imageSrc} slug={section.slug} path="/help" />
      ))}
    </div>
  );
};

const Home = ({ fallback }) => (
  <SWRConfig value={{ fallback }}>
    <Wrapper>
      <div className="grid grid-cols-1 grid-rows-[auto,180px,auto]">
        <div className="row-span-2 row-start-1 bg-center bg-cover col-span-full" style={{ backgroundImage: `url('/assets/hero.png')` }}>
          <div className="bg-snu-purple-900 bg-opacity-95 h-full">
            <div className="pt-24 pb-[276px] wrapper">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">Base de connaissance</h1>
              <h6 className="text-snu-purple-100 max-w-3xl text-base md:text-lg lg:text-xl">
                Retrouvez ici toutes les réponses aux questions et les tutoriels d’utilisation de la plateforme .
              </h6>
            </div>
          </div>
        </div>
        <Sections />
      </div>
      <button className="bg-white text-[#4F46E5] my-[70px] text-base shadow-base rounded-md py-3.5 px-5 mx-auto">Je n’ai pas trouvé réponse à ma question</button>
    </Wrapper>
  </SWRConfig>
);

export default Home;

// https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data
export async function getStaticProps() {
  const response = await API.getasync({ path: "/support-center/knowledge-base" });
  return {
    props: {
      fallback: {
        "/support-center/knowledge-base": response,
      },
    }, // will be passed to the page component as props
  };
}
