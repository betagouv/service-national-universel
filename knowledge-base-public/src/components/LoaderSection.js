const LoaderSection = () => (
  <div className="mx-2 my-4 flex w-72 min-w-1/4 flex-shrink grow-0">
    <article className="relative flex flex-grow flex-col overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="flex h-32 w-full items-center justify-center overflow-hidden bg-gray-200">
        <div className="h-full w-full bg-gray-200">
          <div className="animated-background" />
        </div>
      </div>
      <header className="mb-2 mt-2 flex flex-col items-start justify-start px-8 pt-6 pb-8 leading-tight">
        <div className="mb-5  h-2 w-full bg-gray-200" />
        <div className="mb-5  h-2 w-full bg-gray-200" />
        <div className="mb-5  h-2 w-full bg-gray-200" />
      </header>
    </article>
  </div>
);

export default LoaderSection;
