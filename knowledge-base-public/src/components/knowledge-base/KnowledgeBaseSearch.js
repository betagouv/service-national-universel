import { Fragment, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import useUser from '../../hooks/useUser'
import API from '../../services/api'

export default function KnowledgeBaseSearch({ open, setOpen }) {
    const { restriction } = useUser();
    const [search, setSearch] = useState('')
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null)
    const [items, setItems] = useState([]);
    const searchTimeout = useRef(null);

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const computeSearch = (e) => {
        const search = e.target.value
        setSearch(search);
        if (search.length > 0 && !isSearching) setIsSearching(true);
        if (!search.length) {
            setIsSearching(false);
            setSearch("");
            clearTimeout(searchTimeout.current);
            setItems([]);
            return;
        }
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            const response = await API.get({ path: `/knowledge-base/${restriction}/search`, query: { search } });
            setIsSearching(false);
            if (response.ok) {
                setItems(response.data);
            }
        }, 1000);
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
                    <div className="flex flex-col min-h-full items-end justify-start p-4 text-center sm:items-center sm:p-0 sm:pt-44">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel>
                                <Combobox as="div" value={selectedPerson} onChange={setSelectedPerson}>
                                    <div className="relative mt-2 w-full max-w-[40rem]">
                                        <Combobox.Input
                                            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-800 shadow-sm sm:text-sm sm:leading-6"
                                            onChange={computeSearch}
                                            displayValue={(person) => person?.name}
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </Combobox.Button>

                                        {items.length > 0 && (
                                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {items.map((person) => (
                                                    <Combobox.Option
                                                        key={person.id}
                                                        value={person}
                                                        className={({ active }) =>
                                                            classNames(
                                                                'relative cursor-default select-none py-2 pl-3 pr-9',
                                                                active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                                            )
                                                        }
                                                    >
                                                        {({ active, selected }) => (
                                                            <>
                                                                <span className={classNames('block truncate', selected && 'font-semibold')}>{person.name}</span>

                                                                {selected && (
                                                                    <span
                                                                        className={classNames(
                                                                            'absolute inset-y-0 right-0 flex items-center pr-4',
                                                                            active ? 'text-white' : 'text-blue-600'
                                                                        )}
                                                                    >
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Combobox.Option>
                                                ))}
                                            </Combobox.Options>
                                        )}
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
