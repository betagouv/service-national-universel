import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, Transition } from "@headlessui/react";
import { HiChevronDown, HiTrash } from "react-icons/hi";
import { toast } from "react-hot-toast";
import API from "../../../../services/api";
import { capture } from "../../../../sentry";
import Checkbox from "./Checkbox";
import { on } from "process";

type Tag = {
  _id: string;
  name: string;
  userVisibility: string;
};

interface DropdownTagsProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  filter: Record<string, any>;
}

const DropdownTags = ({ selectedTags, onChange, filter }: DropdownTagsProps) => {
  const [ticketCounts, setTicketCounts] = useState({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [terms, setTerms] = useState("");
  const queryClient = useQueryClient();

  const handleChangeState = (contactDepartment, value) => {
    if (value) return onChange([...new Set([...selectedTags, contactDepartment])]);
    return onChange(selectedTags?.filter((item) => item !== contactDepartment));
  };

  const { mutate: fetchTags, isPending: isLoadingTags } = useMutation({
    mutationFn: async () => {
      const res = await API.get({
        path: "/tag/search",
        query: { q: undefined },
      });
      if (!res.ok) throw new Error(res.code);
      const tagsVisible = res.data.filter((tag) => tag.userVisibility !== "OLD");
      return tagsVisible;
    },
    onError: (error) => {
      toast.error(error.message);
      capture(error);
    },
    onSuccess: (data) => {
      setTags(data);
      queryClient.setQueryData(["tags"], data);
    },
  });

  const fetchTicketCounts = async () => {
    try {
      const query: {
        tag: string[];
        status?: string;
      } = { ...filter, tag: selectedTags };
      // if (filter.status) query.status = filter.status;

      const response = await API.post({ path: "/ticket/search", body: query });
      if (response.ok) {
        const { aggregations } = response;
        if (aggregations?.tag && Array.isArray(aggregations.tag)) {
          const counts = aggregations.tag.reduce((acc, item) => {
            const buckets = item.status?.buckets || [];
            acc[item.key] = buckets.reduce((sum, bucket) => sum + bucket.doc_count, 0);
            return acc;
          }, {});
          setTicketCounts(counts);
        }
      }
    } catch (error) {
      capture("Error fetching ticket counts:", error);
    }
  };

  const tagsFilterd = useMemo(() => {
    return tags.filter((tag) => tag.name.toLowerCase().includes(terms.toLowerCase()));
  }, [tags, terms]);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (tags.length > 0) {
      fetchTicketCounts();
    }
  }, [filter, selectedTags]);

  return (
    <div>
      <Popover className="relative grow">
        <Popover.Button className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white py-2 pl-4 pr-3 min-w-[120px]">
          <span className="text-left text-sm text-grey-text">Etiquette</span>
          <HiChevronDown className="text-xl text-gray-500" />
        </Popover.Button>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel
            className="absolute z-10 mt-2 flex w-full min-w-[224px] origin-top-left flex-col overflow-y-scroll rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5"
            style={{ height: "403px" }}
          >
            <div className="flex justify-end">
              <input
                type="text"
                value={terms}
                className="w-full border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
                placeholder="Rechercher etiquette"
                onChange={(e) => setTerms(e.target.value)}
              />
              <button
                className="p-2 text-m text-red-500 hover:text-red-300 hover:bg-gray-100 rounded-md mr-1"
                onClick={() => {
                  setTerms("");
                  onChange([]);
                }}
              >
                <HiTrash />
              </button>
            </div>
            {tagsFilterd.map((tag) => (
              <Checkbox
                key={tag._id}
                name={`${tag.name} (${ticketCounts[tag._id] || 0})`}
                state={selectedTags?.includes(tag._id)}
                setState={(v) => handleChangeState(tag._id, v)}
              />
            ))}
          </Popover.Panel>
        </Transition>
      </Popover>
      <div className="mt-2 grid grid-cols-1 gap-1" style={{ maxHeight: "110px", overflowY: "auto" }}>
        {selectedTags?.map((selected) => (
          <span key={selected} className="rounded-xl bg-purple-100 px-1 text-center font-medium text-purple-800">
            {tags.find((tag) => tag._id === selected)?.name || selected} ({ticketCounts[selected] || 0})
          </span>
        ))}
      </div>
    </div>
  );
};

export default DropdownTags;
