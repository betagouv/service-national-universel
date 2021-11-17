import Head from "next/head";
import Layout from "../../../components/Layout";
import useUser from "../../../hooks/useUser";

const KnowledgeBase = () => {
  const { user } = useUser({ redirectTo: "/admin/auth" });

  return (
    <>
      <Head>
        <title>SNU - Admin Support - Base de connaissance</title>
      </Head>
      <Layout>KNOWLEDGE</Layout>
    </>
  );
};

export default KnowledgeBase;
