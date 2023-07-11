import { Combobox } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export default function SearchResults({ isSearching, items }) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="absolute z-10 mt-1 max-h-[800px] w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
      {isSearching ? (
        <p className="animate-pulse p-3 text-left font-medium text-gray-500">Recherche en cours...</p>
      ) : (
        <Combobox.Options>
          {items.length > 0 ? (
            items.map((item) => (
              <Combobox.Option
                key={item._id}
                value={item}
                className={({ active }) => classNames("relative cursor-pointer select-none border-b-2 border-gray-100 p-4", active ? "bg-blue-600 text-white" : "text-gray-900")}
              >
                {({ selected }) => (
                  <div className="flex justify-between">
                    <p className={classNames("block truncate", selected && "font-semibold")}>{item.title}</p>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                )}
              </Combobox.Option>
            ))
          ) : (
            <>
              <p className="p-3 text-left font-medium text-gray-500">Aucun résultat ne correspond à votre recherche.</p>
              <hr />
            </>
          )}
          <Combobox.Option
            key="noresult"
            value="noresult"
            className={({ active }) => classNames("relative cursor-pointer select-none border-b-2 border-gray-100 p-4", active ? "bg-blue-600 text-white" : "text-gray-900")}
          >
            {({ selected }) => (
              <div className="flex justify-between">
                <p className={classNames("block truncate", selected && "font-semibold")}>Vous avez une question ? Contactez-nous</p>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            )}
          </Combobox.Option>
        </Combobox.Options>
      )}
    </div>
  );
}
