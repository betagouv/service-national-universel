import Link from "next/link";
import { HiChevronRight, HiOutlineBadgeCheck, HiOutlineBookmarkAlt } from "react-icons/hi";

import Wrapper from "../components/Wrapper";

const SubPhase2 = () => {
  return (
    <Wrapper>
      <div className="bg-[#32257F]">
        <div className="px-8 wrapper pt-10 pb-[52px]">
          <div className="flex items-center px-6 bg-white rounded-md mb-7 h-11 w-max shadow-base">
            <span className="text-sm text-gray-500">La mission d’intérêt général</span>
          </div>
          <span className="inline-block uppercase mb-2.5 text-[#C7D2FE] font-bold text-sm lg:text-base">Phase 2</span>
          <h2 className="lg:text-5xl text-3xl md:text-4xl mb-2.5 text-white font-bold">La mission d’intérêt général</h2>
          <p className="lg:text-base text-sm text-[#C7D2FE]">
            La mission d’intérêt général vise à développer la culture de l’engagement ainsi qu’à renforcer la responsabilité et l’autonomie des jeunes.
          </p>
        </div>
      </div>

      <div className="flex flex-col py-12 gap-14 md:gap-0 md:py-0 md:flex-row wrapper">
        <div className="border-gray-300 md:pt-6 md:pr-4 md:border-r md:w-2/3 lg:pt-10 lg:pr-11 md:pb-14 lg:pb-28">
          <h6 className="text-[#32257F] px-4 font-bold text-sm mb-6 uppercase">sujets populaires</h6>
          <div className="flex flex-col gap-5 lg:gap-8">
            <PopularCard title="🤝 Phase 2 : le parcours d'une MIG" link="#" />
            <PopularCard title="🔍 Je cherche de nouvelles associations (Annuaire des associations)" link="#" />
            <PopularCard title="🤝 Phase 2 : le parcours d'une MIG" link="#" />
            <PopularCard title="👋 J'invite une nouvelle structure" link="#" />
            <PopularCard title="✔️ Je valide une mission" link="#" />
            <PopularCard title="📇 La fiche mission et ses actions" link="#" />
            <PopularCard title="🌀 Je créé une MIG depuis le profil d'un volontaire (JSP, PM, MIG inversée, cohorte 2020)" link="#" />
            <PopularCard title="✍️ Je propose une mission à un volontaire" link="#" />
            <PopularCard title="✍️ Je relance une structure sur une candidature en attente de validation" link="#" />
          </div>
        </div>
        <div className="md:pt-6 md:pl-4 md:w-1/3 lg:pt-10 lg:pl-11">
          <h6 className="text-[#32257F] px-4 font-bold text-sm mb-6 uppercase">sujets populaires</h6>
          <div className="flex flex-col gap-5 lg:gap-8">
            <CategoryCard title="Critères d'éligibilité MIG et structure" icon={<HiOutlineBadgeCheck />} link="#" />
            <CategoryCard title="Le contrat d’engagement" icon={<HiOutlineBookmarkAlt />} link="#" />
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

const CategoryCard = ({ title, icon, link }) => (
  <Link href={link}>
    <div className="flex flex-col gap-4 p-6 bg-white cursor-pointer lg:p-8 shadow-block rounded-2xl">
      <div className="bg-[#C93D38] lg:h-12 lg:w-12 w-10 h-10  rounded-md flex items-center justify-center">
        <div className="text-xl text-white lg:text-2xl">{icon}</div>
      </div>
      <span className="inline-block text-lg font-bold text-gray-900 lg:text-xl">{title}</span>
    </div>
  </Link>
);

export default SubPhase2;
