import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { FC } from "react";
import { NavLink } from "react-router-dom";

type Props = {
  nodes: CollectionMap;
};
export const CollectionTreeItem: FC<Props> = ({ nodes }) => (
  <TreeItem
    key={nodes.id}
    itemId={nodes.id}
    label={
      <NavLink to={`/collection/${nodes.custom_key}`}>{nodes.name}</NavLink>
    }
  >
    {Array.isArray(nodes.children)
      ? nodes.children.map((node) => (
          <CollectionTreeItem key={node.id} nodes={node} />
        ))
      : null}
  </TreeItem>
);
