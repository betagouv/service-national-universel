import { Fragment, useRef, useState } from "react"
import { useRouter } from "next/router"
import useUser from "../../hooks/useUser"
import API from "../../services/api"
import { Combobox, Dialog, Transition } from "@headlessui/react"
import { XCircleIcon, MagnifyingGlassIcon, ChevronLeftIcon } from "@heroicons/react/24/solid"
import SearchResults from "./SearchResults"

export default function KnowledgeBaseSearch({ open = false, setOpen }) {
  const { restriction } = useUser();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null)
  const [items, setItems] = useState([]);
  const searchTimeout = useRef(null);
  const router = useRouter();

  const computeSearch = (e) => {
    const search = e.target.value
    setQuery(search);
    if (search.length > 0 && !isSearching) setIsSearching(true);
    if (!search.length) {
      setIsSearching(false);
      clearTimeout(searchTimeout.current);
      setItems([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      const response = await API.get({ path: `/knowledge-base/${restriction}/search`, query: { search } });
      setIsSearching(false);
      if (response.ok) setItems(response.data);
    }, 1000);
  };

  const handleDelete = () => {
    setSelectedItem(null);
    setItems([]);
  };

  const handleSelect = (item) => {
    setOpen(false);
    setSelectedItem(item);
    setItems([]);
    if (item === "noresult") return router.push("https://moncompte.snu.gouv.fr/public-besoin-d-aide");
    return router.push(`/base-de-connaissance/${item.slug}?loadingType=article`, undefined, { shallow: true, });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex flex-col min-h-full items-end justify-start p-4 text-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full md:w-[40rem] md:mt-44">
                <Combobox as="div" value={selectedItem} onChange={handleSelect}>
                  <div className="relative mt-2 w-full">
                    <Combobox.Input
                      className="w-full rounded-md border-0 bg-white p-3 px-10 text-gray-800 shadow-sm sm:text-sm sm:leading-6"
                      onChange={computeSearch}
                      displayValue={query}
                      placeholder="Rechercher un article"
                    />

                    <div className="absolute inset-y-0 left-0 flex items-center">
                      {query ? (
                        <button onClick={() => setOpen(false)} className="ml-3 reset">
                          <ChevronLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </button>
                      ) : (
                        <MagnifyingGlassIcon className="h-5 w5 px-3 text-gray-400" aria-hidden="true" />
                      )}
                    </div>

                    {query ? (<Combobox.Button onClick={handleDelete} className="absolute inset-y-0 right-0 items-center px-3 focus:outline-none bg-transparent border-none shadow-none">
                      <XCircleIcon className="text-gray-400 h-5 w-5" aria-hidden="true" />
                    </Combobox.Button>) : null}

                    {query && <SearchResults isSearching={isSearching} items={items} />}

                  </div>
                </Combobox>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
