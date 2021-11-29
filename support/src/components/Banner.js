const Banner = ({ title, tag, text, category }) => {
  return (
    <div className="bg-[#32257F]">
      <div className="px-8 wrapper pt-10 pb-[52px]">
        {tag && (
          <div className="flex items-center px-6 bg-white rounded-md mb-7 h-11 w-max shadow-base">
            <span className="text-sm text-gray-500">{tag}</span>
          </div>
        )}
        <span className="inline-block uppercase mb-2.5 text-[#C7D2FE] font-bold text-sm lg:text-base">{category}</span>
        <h2 className="lg:text-5xl text-3xl md:text-4xl mb-2.5 text-white font-bold">{title}</h2>
        <p className="lg:text-base text-sm text-[#C7D2FE]">
          {text}
        </p>
      </div>
    </div>
  )
};

export default Banner;
