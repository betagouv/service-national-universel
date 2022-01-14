import { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import API from "../../services/api";
import KnowledgeBasePublicContent from "../../components/knowledge-base/KnowledgeBasePublicContent";
import useUser from "../../hooks/useUser";
import Modal from "../../components/Modal";
import Link from "next/link";
import { appURL, supportURL } from "../../config";

const Content = () => {
  const router = useRouter();
  const slug = useMemo(() => router.query?.slug || "", [router.query?.slug]);

  const { user } = useUser();

  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base/${user.restriction}/${slug}` }));
  const { cache } = useSWRConfig();
  const item = useMemo(() => response?.data || {}, [response?.data]);

  const [showLoginModal, setShowLoginModal] = useState(false);

  // FIXME: this hack is to prevent the modal to popup after a volontaire logged in from the `appURL` url
  // this can be fixed by adding the page in /support folder
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (response?.code === "NOT_FOUND") {
        router.replace("/base-de-connaissance");
      }
      if (response?.code === "OPERATION_NOT_ALLOWED") {
        setShowLoginModal(true);
      } else {
        setShowLoginModal(false);
      }
    }
  }, [response?.code, isMounted]);

  return (
    <>
      <KnowledgeBasePublicContent item={item} isLoading={!Object.keys(item).length} />
      <Modal isOpen={showLoginModal} onRequestClose={() => setShowLoginModal(false)} className="flex flex-col items-start">
        <h2 className="font-bold ml-4 mb-16 text-xl">Vous devez vous connecter pour accéder à cet article</h2>
        <div className="flex items-center justify-center w-full flex-col gap-3">
          <Link href={`/admin/auth?redirect=${supportURL}/base-de-connaissance/${slug}`} onClick={() => cache.clear()}>
            <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Espace professionnel</span>
          </Link>
          <Link href={`${appURL}/auth?redirect=${supportURL}/base-de-connaissance/${slug}`} onClick={() => cache.clear()}>
            <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600 mb-4">Espace volontaire</span>
          </Link>
          <Link href="/base-de-connaissance">
            <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Retour à l'accueil</span>
          </Link>
        </div>
      </Modal>
    </>
  );
};

const AuthContent = () => {
  const { isLoading } = useUser();

  if (isLoading) return <KnowledgeBasePublicContent isLoading />;

  return <Content />;
};

const Home = () => <AuthContent />;

export default Home;
