import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import API from "../../services/api";
import { useRouter } from "next/router";

const useIsActive = ({ slug, title }, onIsActive) => {
  const router = useRouter();

  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(slug === router.query?.slug);
  }, [router.query?.slug]);

  useEffect(() => {
    if (!!onIsActive) {
      if (!!active) {
        onIsActive(true);
      } else {
        onIsActive(false);
      }
    }
  }, [active]);
  return active;
};

const Branch = ({ section, level, onIsActive }) => {
  const [open, setIsOpen] = useState(section.type === "root");

  const isActive = useIsActive(section, onIsActive);

  const onChildIsActive = (childIsActive) => {
    if (!!childIsActive) setIsOpen(true);
    if (onIsActive) onIsActive();
  };

  return (
    <details className={`ml-${level * 2}`} open={open || isActive}>
      <summary className={` text-warmGray-500 ${isActive ? "font-bold" : ""}`}>
        <Link href={`/admin/knowledge-base/${section.slug}`} passHref>
          {section.title || (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          )}
        </Link>
      </summary>
      {section.children?.map((child) =>
        child.type === "section" ? (
          <Branch key={child._id} section={child} level={level + 1} onIsActive={onChildIsActive} />
        ) : (
          <Answer key={child._id} answer={child} level={level + 1} onIsActive={onChildIsActive} />
        )
      )}
    </details>
  );
};

const Answer = ({ answer, level, onIsActive }) => {
  const isActive = useIsActive(answer, onIsActive);

  return (
    <Link key={answer._id} href={`/admin/knowledge-base/${answer.slug}`} passHref>
      <a href="#" className={`text-warmGray-500 block ml-${level * 2} ${isActive ? "font-bold" : ""}`}>
        {`\u2022\u00A0\u00A0\u00A0 ${answer.title}`}
      </a>
    </Link>
  );
};

const KnowledgeBaseTree = ({ visible, setVisible }) => {
  const { data: response } = useSWR(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));

  const [data, setData] = useState(response?.data || []);
  useEffect(() => {
    setData(response?.data || []);
  }, [response?.data]);

  return (
    <div className={`flex flex-col flex-grow-0 flex-shrink-0 border-l-2 p-2 ${visible ? "w-80" : "w-0 hidden"}`}>
      {/* TODO find a way for tailwind to not filter margins from compiling,
       because things like `ml-${level}` are not compiled */}
      <div className="hidden ml-2 ml-3 ml-4 ml-6 ml-8 ml-10 ml-12 ml-14"></div>
      <div className="p-2 flex flex-row-reverse">
        <svg onClick={() => setVisible(false)} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <Branch section={data} level={0} />
    </div>
  );
};

export default KnowledgeBaseTree;
