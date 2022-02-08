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
  const { router } = useRouter();
  const onLogout = async () => {
    await API.post({ path: "/referent/logout" });
    mutate(null);
    cache.clear();
    router.push("/admin/auth");
  };
  return (
    <div className="text-snu-purple-900 list-none flex-shrink-0 flex-grow-0 flex w-full pr-4 py-2 bg-white transition-transform">
      <div className="flex-shrink flex-grow">
        <KnowledgeBaseSearch path="/admin/base-de-connaissance" placeholder="Recherche" restriction="admin" showAllowedRoles noAnswer="Il n'y a pas de résultat 👀" />
      </div>
      <ProfileButton onLogout={onLogout} user={user}>
        <Link href={`/base-de-connaissance/${router?.query?.slug}`}>
          <a href="#" className="text-sm font-medium text-gray-700 cursor-pointer">
            Base de connaissance publique
          </a>
        </Link>
        <Link href={adminURL}>
          <a href="#" className="text-sm font-medium text-gray-700 cursor-pointer">
            Espace admin SNU
          </a>
        </Link>
      </ProfileButton>
    </div>
  );
};

export default TopBar;
