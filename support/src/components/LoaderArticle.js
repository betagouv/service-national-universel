const LoaderArticle = () => (
  <div className="my-1 w-full shrink-0 grow-0 lg:my-4">
    <article className="flex items-center overflow-hidden rounded-lg bg-white py-6 shadow-lg">
      <div className="flex flex-grow flex-col">
        <header className="relative flex items-center justify-between px-8 leading-tight">
          <div className="h-2 w-full bg-gray-200">
            <div className="animated-background" />
          </div>
        </header>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="mr-6 h-4 w-4 shrink-0 grow-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </article>
  </div>
);

export default LoaderArticle;
