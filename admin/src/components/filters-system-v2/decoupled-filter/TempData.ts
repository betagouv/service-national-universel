import { ItemDecoupledFilterData } from "./DecoupledFilter";

export const tempDecoupledFilterData: ItemDecoupledFilterData[] = [
  {
    checked: false,
    label: "Parent 1",
    value: "parent1",
    count: 10,
    children: [
      {
        checked: false,
        label: "Child 1.1",
        value: "child1.1",
        count: 5,
        children: [
          {
            checked: false,
            label: "Grandchild 1.1.1",
            value: "grandchild1.1.1",
            count: 2,
          },
        ],
      },
      {
        checked: false,
        label: "Child 1.2",
        value: "child1.2",
        count: 3,
      },
    ],
  },
  {
    checked: false,
    label: "Parent 2",
    value: "parent2",
    count: 8,
    children: [
      {
        checked: false,
        label: "Child 2.1",
        value: "child2.1",
        count: 4,
      },
    ],
  },
  {
    checked: false,
    label: "Parent 3",
    value: "parent3",
    count: 12,
  },
  {
    checked: false,
    label: "Parent 4",
    value: "parent4",
    count: 7,
    children: [
      {
        checked: false,
        label: "Child 4.1",
        value: "child4.1",
        count: 3,
      },
    ],
  },
  {
    checked: false,
    label: "Parent 5",
    value: "parent5",
    count: 15,
  },
  {
    checked: false,
    label: "Parent 6",
    value: "parent6",
    count: 9,
    children: [
      {
        checked: false,
        label: "Child 6.1",
        value: "child6.1",
        count: 4,
      },
      {
        checked: false,
        label: "Child 6.2",
        value: "child6.2",
        count: 3,
        children: [
          {
            checked: false,
            label: "Grandchild 6.2.1",
            value: "grandchild6.2.1",
            count: 1,
          },
        ],
      },
    ],
  },
  {
    checked: false,
    label: "Parent 7",
    value: "parent7",
    count: 11,
  },
  {
    checked: false,
    label: "Parent 8",
    value: "parent8",
    count: 6,
    children: [
      {
        checked: false,
        label: "Child 8.1",
        value: "child8.1",
        count: 2,
      },
    ],
  },
  {
    checked: false,
    label: "Parent 9",
    value: "parent9",
    count: 13,
  },
  {
    checked: false,
    label: "Parent 10",
    value: "parent10",
    count: 5,
    children: [
      {
        checked: false,
        label: "Child 10.1",
        value: "child10.1",
        count: 3,
      },
    ],
  },
];
