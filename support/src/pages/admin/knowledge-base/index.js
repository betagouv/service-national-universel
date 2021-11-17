import Head from "next/head";
import Layout from "../../../components/Layout";
import withAuth from "../../../hocs/withAuth";

const KnowledgeBase = () => {
  return (
    <>
      <Head>
        <title>SNU - Admin Support - Base de connaissance</title>
      </Head>
      <Layout>KNOWLEDGE</Layout>
    </>
  );
};

export default withAuth(KnowledgeBase);
