import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

import Wrapper from "../components/Wrapper";

const Post = () => {
  return (
    <Wrapper>
      <div className="bg-[#32257F]">
        <div className="px-8 wrapper flex-col md:flex-row items-start pt-10 pb-[52px] flex md:items-center gap-4">
          <div className="flex-1">
            {/* <div className="flex items-center px-6 bg-white rounded-md mb-7 h-11 w-max shadow-base">
              <span className="text-sm text-gray-500">La mission d’intérêt général / Critères d'éligibilité MIG et structure</span>
            </div> */}
            <span className="inline-block uppercase mb-2.5 text-[#C7D2FE] font-bold text-sm lg:text-base">mon compte</span>
            <h2 className="text-2xl font-bold text-white lg:text-5xl md:text-3xl">🔐 J'ai oublié mon mot de passe</h2>
          </div>

          <button className="flex-none bg-white text-[#32257F] lg:text-base text-sm font-medium py-3 shadow-base px-5">Editer</button>
        </div>
      </div>

      <div className="wrapper">
        <p className="text-base text-gray-500 md:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui iusto harum tenetur quas dolorum voluptatem iure minus fuga. Nostrum voluptatum qui tenetur voluptates et
          perferendis, culpa neque id fugit nulla commodi recusandae dolorem iure. Odit eius, consequatur, praesentium beatae nemo eligendi soluta quas iure ad omnis eaque
          accusantium blanditiis itaque ipsa animi ratione consequuntur sequi. Alias laudantium esse amet et consectetur maxime necessitatibus laborum possimus ducimus a doloremque
          nemo aperiam saepe, dolore repudiandae veniam odio blanditiis numquam? Excepturi illum asperiores incidunt fugiat nobis sunt deserunt fuga repellendus atque voluptatibus
          saepe, eum quod in! Dolorum possimus repudiandae repellendus et esse sed ducimus magni cum quidem, magnam rem nihil optio! Suscipit dolorum pariatur possimus libero eos
          sint dolorem mollitia! Laudantium quibusdam at debitis saepe dolor vel iure cupiditate odit quas laborum delectus veniam voluptatum tenetur distinctio illum natus
          quisquam obcaecati officia magnam esse aspernatur, voluptates, nihil fugiat. Repellendus, iure in aspernatur autem maxime saepe, veritatis ipsam quod temporibus amet
          distinctio quisquam delectus nisi hic tenetur sed consectetur. Numquam ut voluptate adipisci velit fuga hic aspernatur ipsa voluptatum eligendi enim, officia eveniet illo
          porro voluptates iste sed nisi nulla aperiam repudiandae. Eveniet fuga qui soluta delectus atque quam dolores vitae? Id veniam, laboriosam vero odit explicabo debitis
          aperiam commodi officia sint similique corporis omnis eligendi facere possimus consectetur officiis, provident reiciendis enim doloribus et aliquid quam. Non vel,
          dignissimos accusantium debitis harum quod quas repudiandae ex est inventore illum ipsum dolorum distinctio accusamus vero, magnam atque iure soluta modi, aperiam
          laborum. Aspernatur, saepe?
        </p>
      </div>
    </Wrapper>
  );
};

const PopularCard = ({ title, link }) => (
  <Link href={link}>
    <div className="flex items-center justify-between gap-4 py-6 cursor-pointer px-9 shadow-block rounded-2xl">
      <span className="text-lg font-medium text-gray-900">{title}</span>
      <HiChevronRight className="text-xl text-gray-400" />
    </div>
  </Link>
);

export default Post;
