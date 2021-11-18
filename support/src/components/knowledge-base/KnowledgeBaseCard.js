import Image from "next/image";

const KnowledgeBaseCard = ({ imageSrc, imageAlt, title, description, roles = [] }) => {
  return (
    <a href="#" className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
      <article className="overflow-hidden rounded-lg shadow-lg">
        <div className="h-56 w-full bg-gray-300 flex items-center justify-center">
          {!!imageSrc ? <img alt={imageAlt} className="block h-auto w-full" src={imageSrc} /> : <span className="text-gray-400">Pas d'image</span>}
        </div>
        <header className="flex items-center justify-between leading-tight p-2 md:p-4">
          <h1 className="text-lg">
            <a className="no-underline hover:underline text-black" href="#">
              Article Title
            </a>
          </h1>
          <p className="text-grey-darker text-sm">11/1/19</p>
        </header>

        <footer className="flex items-center justify-between leading-none p-2 md:p-4">
          <a className="flex items-center no-underline hover:underline text-black" href="#">
            <img alt="Placeholder" className="block rounded-full" src="https://picsum.photos/32/32/?random" />
            <p className="ml-2 text-sm">Author Name</p>
          </a>
          <a className="no-underline text-grey-darker hover:text-red-dark" href="#">
            <span className="hidden">Like</span>
            <i className="fa fa-heart"></i>
          </a>
        </footer>
      </article>
    </a>
  );
};
// <div className="w-72 rounded max-h-96 overflow-hidden shadow-lg flex flex-col">
//   {!!imageSrc ? <Image width="288" height="156" src={imageSrc} alt={imageAlt} className /> : <Image src="/assets/logo-snu.png" alt="Logo SNU" width="288px" height="156px" />}
//   <div className="px-6 py-4">
//     <div className="font-bold text-xl mb-2">{title}</div>
//     {!!description && <p className="text-gray-700 text-base">{description}</p>}
//   </div>
//   <div className="px-6 pt-4 pb-2">
//     {roles.map((role) => (
//       <span key={role} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
//         {role}
//       </span>
//     ))}
//   </div>
// </div>

export default KnowledgeBaseCard;
