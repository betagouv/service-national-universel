import { useRouter } from "next/router";
import { useMemo } from "react";

const TicketsFolder = ({ folder }) => {
  const router = useRouter();
  const isActive = useMemo(() => router.query?.inbox === folder._id, [router.query?.inbox]);

  const onClick = () => {
    router.query.inbox = folder._id;
    router.push(router, undefined, { shallow: true });
  };

  return (
    <button
      onClick={onClick}
      data-id={folder._id}
      className={`inline-flex rounded-md border-none shadow-none w-full px-3 justify-between font-normal ${isActive ? "bg-snu-purple-900" : "bg-white text-gray-900"}`}
    >
      {folder.name}
      <em className={`font-normal not-italic px-3 rounded-full bg-gray-100 ${isActive ? "text-gray-900" : "text-gray-600"}`}>{folder.number}</em>
    </button>
  );
};

export default TicketsFolder;
