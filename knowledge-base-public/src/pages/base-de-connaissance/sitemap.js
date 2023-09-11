import Head from "next/head";
import Wrapper from "../../components/Wrapper";
import Breadcrumbs from "../../components/breadcrumbs";
import API from "../../services/api";
import Link from "next/link";
import { adminURL, appURL } from "../../config";
import useUser from "../../hooks/useUser";

const SiteMap = ({ items }) => {
  const { restriction } = useUser();

  return (
    <Wrapper>
      <Head>
        <title>SNU - Base de connaissance - Plan du site</title>
      </Head>
      <div className="bg-white">
        <div className="max-w-6xl mx-auto p-4 mb-8">
          <Breadcrumbs parents={[{ _id: 1, slug: "sitemap", title: "Plan du site" }]} path="/base-de-connaissance" />
          <h1 className="text-3xl font-bold leading-9 py-8">Plan du site</h1>
          <nav>
            <ul className="list-disc ml-4 space-y-6">
              <li>
                <Link href="/" className="text-gray-600 underline hover:text-blue-800">
                  Accueil
                </Link>
              </li>

              {items
                .filter((item) => (restriction ? item.allowedRoles.includes(restriction) : item))
                .map((item) => (
                  <>
                    <li key={item.slug} className="space-x-2">
                      <Link href={"/base-de-connaissance/" + item.slug} className="text-gray-600 underline underline-offset-2 hover:text-blue-800">
                        {item.title}
                      </Link>
                    </li>
                    <ul className="list-disc ml-6 space-y-6">
                      {item.children
                        .filter((child) => (restriction ? child.allowedRoles.includes(restriction) : child))
                        .map((child) => (
                          <li key={child.slug} className="space-x-2">
                            <Link href={"/base-de-connaissance/" + child.slug} className="text-gray-600 underline underline-offset-2 hover:text-blue-800">
                              {child.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </>
                ))}

              <li>
                <a href="https://snu.gouv.fr" rel="noopener noreferrer" target="_blank" className="text-gray-600 underline underline-offset-2 hover:text-blue-800">
                  Retour sur le site du SNU
                </a>
              </li>
              <li>
                <a href={appURL} rel="noopener noreferrer" target="_blank" className="text-gray-600 underline underline-offset-2 hover:text-blue-800">
                  Espace volontaire
                </a>
              </li>
              <li>
                <a href={adminURL} rel="noopener noreferrer" target="_blank" className="text-gray-600 underline underline-offset-2 hover:text-blue-800">
                  Espace professionnel
                </a>
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
  // TODO: implement direct DB querying from Next app instead of Support API:
  // https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.ts
  if (!res.ok) {
    return {
      notFound: true,
    };
  }
  return { props: { items: res.data } };
}

export default SiteMap;
