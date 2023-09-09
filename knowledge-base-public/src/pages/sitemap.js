import Head from "next/head";
import Wrapper from "../components/Wrapper";
import Breadcrumbs from "../components/breadcrumbs";
import API from "../services/api";
import Link from "next/link";

const SiteMap = ({ items }) => {
  // TODO: filter items on second render based on user role
  return (
    <Wrapper home>
      <Head>
        <title>SNU - Base de connaissance</title>
      </Head>
      <div className="bg-white">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs parents={["Accueil", "Plan du site"]} path="/base-de-connaissance" />
          <h1 className="text-3xl font-bold leading-9 py-8">Plan du site</h1>
          <ul className="list-disc ml-4 space-y-6 text-gray-600 underline">
            <li>Accueil</li>

            {items.map((item) => (
              <>
                <li key={item.slug}>
                  <Link href={"/base-de-connaissance/" + item.slug}>{item.title}</Link>
                </li>
                <ul className="list-disc ml-6 space-y-6">
                  {item.children.map((child) => (
                    <li key={child.slug}>
                      <Link href={"/base-de-connaissance/" + child.slug}>{child.title}</Link>
                    </li>
                  ))}
                </ul>
              </>
            ))}

            <li>
              Retour sur le ste du SNU
            </li>
            <li>
              Espace volontaire
            </li>
            <li>
              Espace professionnel
            </li>
          </ul>
        </div>
      </div>
    </Wrapper>
  );
};

export async function getStaticProps() {
  const res = await API.get({ path: "/knowledge-base/sitemap" });
  // Why not query DB here directly?
  return { props: { items: res.data } };
}

export default SiteMap;
