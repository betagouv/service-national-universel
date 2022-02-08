import { useRouter } from "next/router";
import { useMemo } from "react";

const TicketsFolder = ({ folder }) => {
  const router = useRouter();
  const isActive = useMemo(() => (router.query?.inbox || "inbox") === folder._id, [router.query?.inbox]);

  const onClick = () => {
    router.query.inbox = folder._id;
    router.push(router, undefined, { shallow: true });
  };

  return (
    <button
      onClick={onClick}
      data-id={folder._id}
      className={`inline-flex w-full flex-nowrap justify-between rounded-md border-none px-3 font-normal shadow-none ${isActive ? "bg-snu-purple-900" : "bg-white text-gray-900"}`}
    >
      <span className="flex-nowrap truncate whitespace-nowrap">{folder.name}</span>
      <em className={`rounded-full bg-gray-100 px-3 font-normal not-italic ${isActive ? "text-gray-900" : "text-gray-600"}`}>{folder.number}</em>
    </button>
  );
};

export default TicketsFolder;
