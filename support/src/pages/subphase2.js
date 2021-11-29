import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

import Wrapper from "../components/Wrapper";

const Phase2 = () => {
  return (
    <Wrapper>
      <div className="bg-[#32257F]">
        <div className="px-8 wrapper pt-10 pb-[52px]">
          {/* <div className="flex items-center px-6 bg-white rounded-md mb-7 h-11 w-max shadow-base">
            <span className="text-sm text-gray-500">La mission d’intérêt général / Critères d'éligibilité MIG et structure</span>
          </div> */}
          <span className="inline-block uppercase mb-2.5 text-[#C7D2FE] font-bold text-sm lg:text-base">Phase 2</span>
          <h2 className="lg:text-5xl text-3xl md:text-4xl mb-2.5 text-white font-bold">Critères d'éligibilité MIG et structure</h2>
          <p className="lg:text-base text-sm text-[#C7D2FE]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
          </p>
        </div>
      </div>

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

const PopularCard = ({ title, link }) => (
  <Link href={link}>
    <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white cursor-pointer lg:py-6 lg:px-9 shadow-block rounded-2xl">
      <span className="text-lg font-medium text-gray-900">{title}</span>
      <HiChevronRight className="text-xl text-gray-400" />
    </div>
  </Link>
);

export default Phase2;
