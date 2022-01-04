// import ./styles.css in the _app.js file
// import "./styles.css";
import Link from "next/link";

const Breadcrumb = ({ parents, path }) => {
  return (
    <div id="breadcrumb" className="text-sm font-normal flex-shrink-0 w-full bg-snu-purple-900">
      <ul>
        <Crumb href={path} className="root">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Crumb>
        {parents.map(({ _id, slug, title }, index) => (
          <Crumb key={_id} href={`${path}/${slug}`} index={index}>
            {title}
          </Crumb>
        ))}
      </ul>
    </div>
  );
};

const Crumb = ({ href, children, index }) => (
  <>
    <Link href={href} passHref>
      <a href="#" style={{ marginLeft: `${index + 0.5}rem` }} id="mobile">
        {children}
      </a>
    </Link>
    <Link href={href} passHref>
      <a href="#" id="desktop">
        {children}
      </a>
    </Link>
  </>
);

export default Breadcrumb;
