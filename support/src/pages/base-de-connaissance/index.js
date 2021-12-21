import useSWR, { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import API from "../../services/api";
import PublicKBHome from "../../components/knowledge-base/PublicKBHome";

const Sections = () => {
  const { user } = useUser(); // find the user in some way, with the cookie ?

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${user.restriction}` }));

  const [sections, setSections] = useState(response?.data || []);
  useEffect(() => {
    setSections(response?.data || []);
  }, [response?.data]);

  return <PublicKBHome item={{ children: sections }} />;
};

const AuthSections = () => {
  const { isLoading } = useUser(); // find the user in some way, with the cookie ?

  if (isLoading) return <PublicKBHome isLoading />;

  return <Sections />;
};

const Home = ({ fallback }) => (
  <SWRConfig value={{ fallback }}>
    <AuthSections />
  </SWRConfig>
);

export default Home;

// https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data
export async function getStaticProps() {
  const response = await API.getasync({ path: "/support-center/knowledge-base/public" });
  return {
    props: {
      fallback: {
        "/support-center/knowledge-base/public": response,
      },
    }, // will be passed to the page component as props
  };
}
