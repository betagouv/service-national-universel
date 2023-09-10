import Head from "next/head";
import Wrapper from "../../components/Wrapper";
import Breadcrumbs from "../../components/breadcrumbs";
import API from "../../services/api";
import Link from "next/link";
import { adminURL, appURL } from "../../config";
import useUser from "../../hooks/useUser";

const SiteMap = ({ items }) => {
  const { restriction } = useUser();
  const filteredItems = restriction ? items.filter((item) => item.allowedRoles.includes(restriction)) : items;

  return (
    <Wrapper home>
      <Head>
        <title>SNU - Base de connaissance</title>
      </Head>
      <div className="bg-white">
        <div className="max-w-6xl mx-auto p-4">
        <Breadcrumbs parents={[{ _id: 1, slug: "sitemap", title: "Plan du site" }]} path="/base-de-connaissance" />
          <h1 className="text-3xl font-bold leading-9 py-8">Plan du site</h1>
          <nav>
            <ul className="list-disc ml-4 space-y-6 text-gray-600 underline">
              <li>
                <Link href="/">Accueil</Link>
              </li>

              {filteredItems.map((item) => (
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
                <a href="https://snu.gouv.fr">Retour sur le ste du SNU</a>
              </li>
              <li>
                <a href={appURL}>Espace volontaire</a>
              </li>
              <li>
                <a href={adminURL}>Espace professionnel</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Wrapper>
  );
};

export async function getStaticProps() {
  const res = await API.get({ path: "/knowledge-base/sitemap" });
  // Why not query DB here directly?
  if (!res.ok) {
    return {
      notFound: true,
    };
  }
  return { props: { items: res.data } };
}

export default SiteMap;
