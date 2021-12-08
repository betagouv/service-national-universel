import Link from "next/link";

const CategoryCard = ({ title, icon, link }) => (
  <Link href={link}>
    <div className="flex flex-col gap-4 p-6 bg-white cursor-pointer lg:p-8 shadow-block rounded-2xl">
      <div className="bg-[#C93D38] lg:h-12 lg:w-12 w-10 h-10  rounded-md flex items-center justify-center">
        <div className="text-xl text-white lg:text-2xl">{icon}</div>
      </div>
      <span className="inline-block text-lg font-bold text-gray-900 lg:text-xl">{title}</span>
    </div>
  </Link>
);

export default CategoryCard;
