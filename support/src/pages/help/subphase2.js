import PopularCard from "../../components/PopularCard";
import Banner from "../../components/Banner";
import Wrapper from "../../components/Wrapper";

const SubPhase2 = () => {
  return (
    <Wrapper>
      <Banner
        title="Critères d'éligibilité MIG et structure"
        category="Phase 2"
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        tag="Critères d'éligibilité MIG et structure"
      />
      <div className="py-0 wrapper">
        <div className="w-full py-10 mx-auto md:w-2/3 pr-11 pb-28">
          <h6 className="text-[#32257F] px-4 font-bold text-sm mb-6 uppercase">sujets populaires</h6>
          <div className="flex flex-col gap-5 lg:gap-8">
            <PopularCard title="🤝 Quelle mission (MIG) peut être proposée ?" link="#" />
            <PopularCard title="🏠 Quelle structure peut proposer une MIG ?" link="#" />
            <PopularCard title="💙 Solidarités Santé" link="#" />
            <PopularCard title="🎖️ Défense et mémoire" link="#" />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default SubPhase2;
