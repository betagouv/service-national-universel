const LoaderArticle = () => (
  <div className="my-1 w-full shrink-0 grow-0 lg:my-4">
    <article className="flex items-center overflow-hidden rounded-lg shadow-lg bg-white py-6">
      <div className="flex flex-col flex-grow">
        <header className="flex items-center justify-between leading-tight px-8 relative">
          <div className="h-2 bg-gray-200 w-full">
            <div className="animated-background" />
          </div>
        </header>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="grow-0 shrink-0 h-4 w-4 mr-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </article>
  </div>
);

export default LoaderArticle;
