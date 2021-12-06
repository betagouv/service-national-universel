import PopularCard from "../../components/PopularCard";
import CategoryCard from "../../components/CategoryCard";
import Banner from "../../components/Banner";
import { HiOutlineBadgeCheck, HiOutlineBookmarkAlt } from "react-icons/hi";

import Wrapper from "../../components/Wrapper";

const Phase2 = () => {
  return (
    <Wrapper>
      <Banner
        title="La mission d’intérêt général"
        category="Phase 2"
        text="La mission d’intérêt général vise à développer la culture de l’engagement ainsi qu’à renforcer la responsabilité et l’autonomie des jeunes."
        tag="La mission d’intérêt général"
      />
      <div className="flex flex-col py-12 gap-14 md:gap-0 md:py-0 md:flex-row pr-6 pl-6 wrapper">
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
            <CategoryCard title="Critères d'éligibilité MIG et structure" icon={<HiOutlineBadgeCheck />} link="/subphase2" />
            <CategoryCard title="Le contrat d’engagement" icon={<HiOutlineBookmarkAlt />} link="#" />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Phase2;
