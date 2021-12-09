import Wrapper from "../Wrapper";
import KBSectionCard from "./KBSectionCard";
import { useMemo } from "react";
import Loader from "react-loader-spinner";
import KBArticleCard from "./KBArticleCard";
import Breadcrumb from "../BreadCrumb";
import TextEditor from "../TextEditor";

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
              <KBArticleCard key={answer._id} _id={answer._id} position={answer.position} title={answer.title} slug={answer.slug} path="/help" />
            ))}
          </div>
        </section>
      )}
      {!!sections?.length && (
        <section className="flex flex-col w-96 flex-shrink-0  border-l-2 pt-12 ">
          <h3 className="px-10 flex items-center font-bold uppercase text-sm text-snu-purple-900">Catégories</h3>
          <div id="sections" className="flex flex-wrap h-full w-full flex-shrink overflow-y-auto px-12">
            {sections.map((section) => (
              <KBSectionCard
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

const PublicKBContent = ({ item }) => {
  const group = useMemo(() => {
    return item?.group || item?.parents?.[0].group;
  }, [item]);

  return (
    <Wrapper>
      <div className="flex flex-col">
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
        {!item ? (
          <Loader />
        ) : (
          <>
            {item.type === "article" && (
              <div className="container bg-coolGray-100  mx-auto flex flex-col px-8 pt-3 flex-grow flex-shrink overflow-hidden w-full">
                <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
              </div>
            )}
            {item.type === "section" && <Section item={item} />}
          </>
        )}
      </div>
      <button className="bg-white text-[#4F46E5] my-[70px] text-base shadow-base rounded-md py-3.5 px-5 mx-auto">Je n’ai pas trouvé réponse à ma question</button>
    </Wrapper>
  );
};

export default PublicKBContent;
