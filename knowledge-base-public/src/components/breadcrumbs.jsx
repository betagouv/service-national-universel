import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const Breadcrumbs = ({ parents, path }) => {
  return (
    <nav aria-label="Breadcrumb" className="mt-4 text-sm leading-4 print:hidden">
      <ol className="flex flex-wrap items-center">
        <li>
          <Link href={path} className="rounded py-1.5 pr-2">
            Accueil
          </Link>
        </li>
        {parents.map(({ _id, slug, title }) => (
          <li key={_id} className="flex flex-nowrap items-center gap-1">
            <ChevronRightIcon className="h-4" />
            <Link href={`${path}/${slug}`} className="rounded px-2 py-1.5">
              {title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
