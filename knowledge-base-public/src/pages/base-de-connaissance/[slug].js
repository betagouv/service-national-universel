import { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import API from "../../services/api";
import KnowledgeBasePublicContent from "../../components/knowledge-base/KnowledgeBasePublicContent";
import useUser from "../../hooks/useUser";
import Modal from "../../components/Modal";
import Link from "next/link";
import { adminURL, appURL, baseDeConnaissanceURL } from "../../config";
import useDevice from "../../hooks/useDevice";

const Content = () => {
  const router = useRouter();
  const slug = useMemo(() => router.query?.slug || "", [router.query?.slug]);
  const { device } = useDevice();

  const { restriction } = useUser();

  const { data: response } = useSWR(API.getUrl({ path: `/knowledge-base/${restriction}/${slug}` }));
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
      <KnowledgeBasePublicContent item={item} isLoading={!Object.keys(item).length} device={device} />
      <Modal
        isOpen={showLoginModal}
        onRequestClose={() => {
          setShowLoginModal(false);
          router.push("/base-de-connaissance");
        }}
        className="flex flex-col items-start"
      >
        <Link href="/base-de-connaissance">
          <span className="-mt-6 cursor-pointer text-sm font-medium text-black underline transition-colors hover:text-gray-600">Retour à l&apos;accueil</span>
        </Link>
        <h2 className="mb-16 ml-4 mt-6 text-xl font-bold">Vous devez vous connecter pour accéder à cet article</h2>
        <div className="flex w-full flex-col items-center justify-center gap-3">
          <Link href={`${adminURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${slug}`} onClick={() => cache.clear()}>
            <button>Espace professionnel</button>
          </Link>
          <Link href={`${appURL}/auth?redirect=${baseDeConnaissanceURL}/base-de-connaissance/${slug}`} onClick={() => cache.clear()}>
            <button>Espace volontaire</button>
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

export default AuthContent;
