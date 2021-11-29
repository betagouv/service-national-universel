import Wrapper from "../components/Wrapper";
import Link from "next/link";

const Home = () => {
  return (
    <Wrapper>
      <div className="grid grid-cols-1 grid-rows-[auto,180px,auto]">
        <div className="row-span-2 row-start-1 bg-center bg-cover col-span-full" style={{ backgroundImage: `url('/assets/home/hero.png')` }}>
          <div className="bg-[#32257F] bg-opacity-95 h-full">
            <div className="pt-24 pb-[276px] wrapper">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">Base de connaissance</h1>
              <h6 className="text-[#C7D2FE] max-w-3xl text-base md:text-lg lg:text-xl">
                Retrouvez ici toutes les réponses aux questions et les tutoriels d’utilisation de la plateforme .
              </h6>
            </div>
          </div>
        </div>

        <div className="md:px-10 px-6 flex lg:flex flex-col lg:flex-nowrap max-w-screen-2xl mx-auto flex-wrap grid-cols-2 md:grid md:flex-row row-span-2 row-start-2 col-span-full gap-2.5">
          <Card title="Gestion du compte utilisateur" small="mon compte" imgSrc="mon-compte.png" to="/mon-compte" />
          <Card title="L’inscription du volontaire" small="Phase 0" imgSrc="phase-0.png" to="/phase0" />
          <Card title="Le séjour de cohésion" small="Phase 1" imgSrc="phase-1.png" to="/phase1" />
          <Card title="La mission d’intérêt général" small="Phase 2" imgSrc="phase-2.png" to="/phase2" />
          <Card title="L’engagement du volontaire" small="Phase 3" imgSrc="phase-3.png" to="/phase3" />
        </div>
      </div>
      <button className="bg-white text-[#4F46E5] my-[70px] text-base shadow-base rounded-md py-3.5 px-5 mx-auto">Je n’ai pas trouvé réponse à ma question</button>
    </Wrapper>
  );
};

const Card = ({ title, small, imgSrc, to }) => (
  <Link href={to}>
    <div className="flex flex-col overflow-hidden bg-white rounded-lg shadow-lg">
      <div className="h-60">
        <img className="object-cover w-full h-full" src={`/assets/home/${imgSrc}`} alt={title} />
      </div>
      <div className="flex flex-col gap-2 p-6 pb-12">
        <span className="text-[#C93D38] text-xs lg:text-sm uppercase font-bold">{small}</span>
        <span className="text-lg font-bold text-gray-900 lg:text-2xl md:text-xl">{title}</span>
      </div>
    </div>
  </Link>
);

export default Home;
