import Link from "next/link";

const CategoryCard = ({ title, icon, link }) => (
  <Link href={link}>
    <div className="flex cursor-pointer flex-col gap-4 rounded-2xl bg-white p-6 shadow-block lg:p-8">
      <div className="flex h-10 w-10 items-center justify-center  rounded-md bg-[#C93D38] lg:h-12 lg:w-12">
        <div className="text-xl text-white lg:text-2xl">{icon}</div>
      </div>
      <span className="inline-block text-lg font-bold text-gray-900 lg:text-xl">{title}</span>
    </div>
  </Link>
);

export default CategoryCard;
