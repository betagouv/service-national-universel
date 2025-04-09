import React, { useEffect, useState, useCallback, Profiler, useRef, useMemo } from "react";
import { TreeFilterWithoutHeadlessUi as OriginalTreeFilter } from "./TreeFilterWithoutHeadlessUi";
import { TreeFilterWithoutHeadlessUi as OptimizedTreeFilter } from "./TreeFilterWithoutHeadlessUi.optimized";
import { TreeNodeFilterType } from "./TreeFilter";

type ProfilerDataType = {
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  phase: string;
};

export const TreeFilterPerformanceTest = () => {
  const [useOptimized, setUseOptimized] = useState(true);
  const [treeData, setTreeData] = useState<Record<string, TreeNodeFilterType> | null>(null);

  const originalProfilerDataRef = useRef<ProfilerDataType | null>(null);
  const optimizedProfilerDataRef = useRef<ProfilerDataType | null>(null);

  const [displayData, setDisplayData] = useState<{
    original: ProfilerDataType | null;
    optimized: ProfilerDataType | null;
  }>({
    original: null,
    optimized: null,
  });

  const updateDisplayData = useCallback(() => {
    setDisplayData({
      original: originalProfilerDataRef.current,
      optimized: optimizedProfilerDataRef.current,
    });
  }, []);

  const onRenderCallback = useCallback(
    (id: string, phase: string, actualDuration: number, baseDuration: number, startTime: number, commitTime: number) => {
      const data = { actualDuration, baseDuration, commitTime, phase };

      if (id === "optimized-tree-filter") {
        optimizedProfilerDataRef.current = data;
      } else {
        originalProfilerDataRef.current = data;
      }

      setTimeout(updateDisplayData, 100);

      console.log(`Profiler [${id}]:`, { phase, actualDuration, baseDuration, startTime, commitTime });
    },
    [updateDisplayData],
  );

  const optimizedTreeFilter = useMemo(() => {
    if (!treeData) return null;
    return (
      <Profiler id="optimized-tree-filter" onRender={onRenderCallback}>
        <OptimizedTreeFilter id="test-optimized" treeFilter={treeData} showSelectedValues={true} showSelectedValuesCount={true} />
      </Profiler>
    );
  }, [treeData, onRenderCallback]);

  const originalTreeFilter = useMemo(() => {
    if (!treeData) return null;
    return (
      <Profiler id="original-tree-filter" onRender={onRenderCallback}>
        <OriginalTreeFilter id="test-original" treeFilter={treeData} showSelectedValues={true} showSelectedValuesCount={true} />
      </Profiler>
    );
  }, [treeData, onRenderCallback]);

  useEffect(() => {
    const generateTree = () => {
      const result: Record<string, TreeNodeFilterType> = {};

      result["0"] = {
        checked: false,
        label: "Root",
        value: "root",
        childIds: [],
        isLeaf: false,
        isRoot: true,
        groupKey: "root",
      };

      for (let i = 1; i <= 15; i++) {
        const groupId = `group-${i}`;
        result[groupId] = {
          checked: false,
          label: `Group ${i}`,
          value: `group-${i}`,
          childIds: [],
          parentId: "0",
          isLeaf: false,
          isRoot: false,
          groupKey: "group",
        };
        result["0"].childIds!.push(groupId);

        for (let j = 1; j <= 20; j++) {
          const categoryId = `${groupId}-category-${j}`;
          result[categoryId] = {
            checked: false,
            label: `Category ${i}.${j}`,
            value: `category-${i}.${j}`,
            childIds: [],
            parentId: groupId,
            isLeaf: false,
            isRoot: false,
            groupKey: "category",
          };
          result[groupId].childIds!.push(categoryId);

          for (let k = 1; k <= 200; k++) {
            const itemId = `${categoryId}-item-${k}`;
            result[itemId] = {
              checked: Math.random() > 0.8, // Randomly check some items
              label: `Item ${i}.${j}.${k}`,
              value: `item-${i}.${j}.${k}`,
              childIds: [],
              parentId: categoryId,
              isLeaf: true,
              isRoot: false,
              groupKey: "item",
            };
            result[categoryId].childIds!.push(itemId);
          }
        }
      }

      return result;
    };

    setTreeData(generateTree());
  }, []);

  const { original: originalData, optimized: optimizedData } = displayData;
  const currentProfilerData = useOptimized ? optimizedData : originalData;

  if (!treeData) return <div>Loading test data...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">TreeFilter Performance Test</h1>

      <div className="mb-4">
        <button className={`px-4 py-2 mr-2 ${useOptimized ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setUseOptimized(true)}>
          Use Optimized Version
        </button>
        <button className={`px-4 py-2 ${!useOptimized ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setUseOptimized(false)}>
          Use Original Version
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">{useOptimized ? "Optimized" : "Original"} TreeFilter</h2>

          {useOptimized ? optimizedTreeFilter : originalTreeFilter}
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Version</th>
                <th className="border p-2 text-left">Actual Duration (ms)</th>
                <th className="border p-2 text-left">Base Duration (ms)</th>
                <th className="border p-2 text-left">Improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Original</td>
                <td className="border p-2">{originalData ? originalData.actualDuration.toFixed(2) : "-"}</td>
                <td className="border p-2">{originalData ? originalData.baseDuration.toFixed(2) : "-"}</td>
                <td className="border p-2">-</td>
              </tr>
              <tr>
                <td className="border p-2">Optimized</td>
                <td className="border p-2">{optimizedData ? optimizedData.actualDuration.toFixed(2) : "-"}</td>
                <td className="border p-2">{optimizedData ? optimizedData.baseDuration.toFixed(2) : "-"}</td>
                <td className="border p-2">
                  {originalData && optimizedData ? `${((100 * (originalData.actualDuration - optimizedData.actualDuration)) / originalData.actualDuration).toFixed(2)}%` : "-"}
                </td>
              </tr>
            </tbody>
          </table>

          {currentProfilerData && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Current Component React Profiler Data:</h3>
              <ul className="list-disc ml-6">
                <li>Component: {useOptimized ? "Optimized" : "Original"}</li>
                <li>Phase: {currentProfilerData.phase}</li>
                <li>Actual Duration: {currentProfilerData.actualDuration.toFixed(2)} ms</li>
                <li>Base Duration: {currentProfilerData.baseDuration.toFixed(2)} ms</li>
              </ul>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Data Size:</h3>
            <ul className="list-disc ml-6">
              <li>Groups: 5</li>
              <li>Categories per group: 10</li>
              <li>Items per category: 20</li>
              <li>Total nodes: {Object.keys(treeData).length}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
