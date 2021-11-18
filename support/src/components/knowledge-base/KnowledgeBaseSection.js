import useSWR from "swr";
import KnowledgeBaseCard from "./KnowledgeBaseCard";
import KnowledgeBaseCreate from "./KnowledgeBaseCreate";
import withAuth from "../../hocs/withAuth";
import API from "../../services/api";
import { useRouter } from "next/router";

const KnowledgeBaseSection = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { data: response } = useSWR(API.getUrl({ path: `/support-center/knowledge-base${!!slug ? `/${slug}` : ""}`, query: { withTree: true } }));

  const section = response?.data;

  if (!section) return null;

  return (
    <div className="container my-12 mx-auto px-4 md:px-12 overflow-auto">
      <div className="flex flex-wrap -mx-1 lg:-mx-4">
        {section.children.map((item) => (
          <KnowledgeBaseCard key={item._id} title={item.title} date={item.createdAt} author={item.author} tags={item.allowedRoles} slug={item.slug} />
        ))}
        <KnowledgeBaseCreate position={section.children.length + 1} />
      </div>
    </div>
  );
};

export default withAuth(KnowledgeBaseSection);
