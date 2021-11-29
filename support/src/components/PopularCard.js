import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

const PopularCard = ({ title, link }) => (
  <Link href={link}>
    <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white cursor-pointer lg:py-6 lg:px-9 shadow-block rounded-2xl">
      <span className="text-lg font-medium text-gray-900">{title}</span>
      <HiChevronRight className="text-xl text-gray-400" />
    </div>
  </Link>
);

export default PopularCard;
