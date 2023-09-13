import Link from "next/link";

const Breadcrumbs = ({ parents, path, className = "text-gray-500" }) => {
  return (
    <nav aria-label="Breadcrumb" className={`mt-4 text-xs leading-4 print:hidden ${className}`}>
      <ol className="flex flex-wrap items-center">
        <li>
          <Link href={path} className="rounded py-1.5">
            Accueil
          </Link>
        </li>
        {parents.map(({ _id, slug, title }) => (
          <li key={_id} className="flex flex-nowrap items-center">
            <span className="material-icons mt-[4px]">keyboard_arrow_right</span>
            <Link href={`${path}/${slug}`} className="rounded py-1.5">
              {title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
