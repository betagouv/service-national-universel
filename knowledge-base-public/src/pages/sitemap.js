import Head from "next/head";
import Wrapper from "../components/Wrapper";
import Breadcrumbs from "../components/breadcrumbs";
import API from "../services/api";
import { useEffect } from "react";

const SiteMap = ({ items }) => {
  useEffect(async () => {
    const res = await API.get({ path: "/knowledge-base/all" });
    console.log("🚀 ~ file: sitemap.js:10 ~ useEffect ~ res:", res.data)
  }, []);

  return (
    <Wrapper home>
      <Head>
        <title>SNU - Base de connaissance</title>
      </Head>
      <div className="bg-white">
        <Breadcrumbs parents={["Accueil", "Plan du site"]} path="/base-de-connaissance" className="" />
        <h1 className="text-3xl font-bold leading-9 py-8">Plan du site</h1>
        {items}
      </div>
    </Wrapper>
  );
};

export async function getStaticProps() {
  const res = await API.get({ path: "/knowledge-base/all" });
  return { props: { items: JSON.stringify(res) } };
}

export default SiteMap;
