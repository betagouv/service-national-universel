import Loader from "./Loader";

const LoaderHomeCard = () => (
  <div className="mx-2 my-4 w-72 flex flex-shrink flex-grow-0 min-w-1/4">
    <article className="overflow-hidden rounded-lg shadow-lg flex flex-col flex-grow bg-white">
      <div className="h-32 w-full bg-gray-200 flex items-center justify-center overflow-hidden">
        <span className="text-gray-400">
          <Loader size="2em" />
        </span>
      </div>
      <header className="flex flex-col items-start justify-start leading-tight mb-2 mt-2 px-8 pt-6 pb-8">
        <div className="h-2  bg-gray-200 w-full mb-5" />
        <div className="h-2  bg-gray-200 w-full mb-5" />
        <div className="h-2  bg-gray-200 w-full mb-5" />
      </header>
    </article>
  </div>
);

export default LoaderHomeCard;
