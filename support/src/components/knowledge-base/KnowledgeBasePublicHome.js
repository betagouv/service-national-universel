import Wrapper from "../../components/Wrapper";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import Loader from "../../components/Loader";
import { useEffect, useState } from "react";

const KnowledgeBasePublicHome = ({ item, isLoading = false }) => {
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    setShowLoading(isLoading);
  }, [isLoading]);
  return (
    <Wrapper>
      <div className="grid grid-cols-1 grid-rows-[auto,180px,auto]">
        <div className="row-span-2 row-start-1 bg-center bg-cover col-span-full" style={{ backgroundImage: `url('/assets/hero.png')` }}>
          <div className="bg-snu-purple-900 bg-opacity-95 h-full">
            <div className="pt-24 pb-[276px] mr-auto ml-auto px-8 max-w-screen-95">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">Base de connaissance</h1>
              <h6 className="text-snu-purple-100 max-w-3xl text-base md:text-lg lg:text-xl">
                Retrouvez ici toutes les réponses aux questions et les tutoriels d&apos;utilisation de la plateforme .
              </h6>
            </div>
          </div>
        </div>
        {showLoading ? <Loader /> : <KnowledgeBasePublicSection item={item} />}
      </div>
      <KnowledgeBasePublicNoAnswer />
    </Wrapper>
  );
};

export default KnowledgeBasePublicHome;
