import React from "react";
import Tree from "react-d3-tree";

type TreeNode = {
  name: string;
  children?: TreeNode[];
};

function arrayToTree(arr: (number | null)[]): TreeNode | null {
  if (!arr.length) return null;

  const nodes: (TreeNode | null)[] = arr.map((val) =>
    val !== null ? { name: String(val) } : null
  );

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i]) {
      const leftIndex = 2 * i + 1;
      const rightIndex = 2 * i + 2;
      const children: TreeNode[] = [];

      if (leftIndex < nodes.length && nodes[leftIndex]) {
        children.push(nodes[leftIndex] as TreeNode);
      }

      if (rightIndex < nodes.length && nodes[rightIndex]) {
        children.push(nodes[rightIndex] as TreeNode);
      }

      if (children.length) {
        nodes[i]!.children = children;
      }
    }
  }

  return nodes[0];
}

const TreeVisualizer = ({ input }: { input: string }) => {
  let parsedInput: (number | null)[];
  try {
    parsedInput = JSON.parse(input);
    if (!Array.isArray(parsedInput)) throw new Error("Input must be an array.");
  } catch (err) {
    return <div style={{ color: "red" }}>Invalid input format for tree visualization.</div>;
  }

  const treeData = arrayToTree(parsedInput);

  return treeData ? (
    <div style={{ height: "300px", marginTop: "1rem" }}>
      <Tree data={treeData} orientation="vertical" />
    </div>
  ) : (
    <div style={{ color: "gray" }}>No tree to display.</div>
  );
};

export default TreeVisualizer;
