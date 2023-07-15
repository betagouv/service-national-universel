import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const Breadcrumbs = ({ parents, path }) => {
  return (
    <nav aria-label="Breadcrumb" className="mt-4 text-sm leading-4 text-gray-500 print:hidden">
      <ol className="flex items-center">
        <li>
          <Link href={path} className="rounded px-2 py-1.5 transition-colors hover:bg-gray-200">
            Accueil
          </Link>
        </li>
        {parents.map(({ _id, slug, title }) => (
          <li key={_id} className="flex items-center gap-1">
            <ChevronRightIcon className="h-5 text-gray-400" />
            <Link href={`${path}/${slug}`} className="rounded px-2 py-1.5 transition-colors hover:bg-gray-200">
              {title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
