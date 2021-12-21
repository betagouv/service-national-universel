import useSWR, { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import Wrapper from "../../components/Wrapper";
import API from "../../services/api";
import PublicKBSection from "../../components/knowledge-base/PublicKBSection";
import PublicKBNoAnswer from "../../components/knowledge-base/PublicKBNoAnswer";
import PublicKBContent from "../../components/knowledge-base/PublicKBContent";

const Sections = () => {
  const { user } = useUser(); // find the user in some way, with the cookie ?

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${user.restriction}` }));

  const [sections, setSections] = useState(response?.data || []);
  useEffect(() => {
    setSections(response?.data || []);
  }, [response?.data]);

  return <PublicKBSection item={{ children: sections }} />;
};

const AuthSections = () => {
  const { isLoading } = useUser(); // find the user in some way, with the cookie ?

  if (isLoading) return <PublicKBContent isLoading />;

  return <Sections />;
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
        <AuthSections />
      </div>
      <PublicKBNoAnswer />
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
