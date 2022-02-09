import KnowledgeBaseSearch from "./knowledge-base/KnowledgeBaseSearch";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSWRConfig } from "swr";
import { adminURL } from "../config";
import useAdminUser from "../hooks/useAdminUser";
import API from "../services/api";
import ProfileButton from "./ProfileButton";

const TopBar = () => {
  const { cache } = useSWRConfig();
  const { mutate, user } = useAdminUser();
  const router = useRouter();
  const onLogout = async () => {
    await API.post({ path: "/referent/logout" });
    mutate(null);
    cache.clear();
    router.push("/admin/auth");
  };
  return (
    <div className="flex w-full shrink-0 grow-0 list-none bg-white py-2 pr-4 text-snu-purple-900 transition-transform">
      <div className="flex-shrink flex-grow">
        <KnowledgeBaseSearch path="/admin/base-de-connaissance" placeholder="Recherche" restriction="admin" showAllowedRoles noAnswer="Il n'y a pas de résultat 👀" />
      </div>
      <ProfileButton onLogout={onLogout} user={user}>
        <Link href={`/base-de-connaissance/${router?.query?.slug}`}>
          <a href="#" className="cursor-pointer text-sm font-medium text-gray-700">
            Base de connaissance publique
          </a>
        </Link>
        <Link href={adminURL}>
          <a href="#" className="cursor-pointer text-sm font-medium text-gray-700">
            Espace admin SNU
          </a>
        </Link>
      </ProfileButton>
    </div>
  );
};

export default TopBar;
