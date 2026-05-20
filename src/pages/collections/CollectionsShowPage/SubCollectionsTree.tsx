import { FC, SyntheticEvent } from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import SvgIcon from "@mui/material/SvgIcon";
import { CollectionTreeItem } from "./CollectionTreeItem";

type Props = {
  collection: Collection;
  collectionMap: MapObject | null;
  expanded: string[] | undefined;
  handleToggle: (
    event: SyntheticEvent<Element, Event>,
    itemIds: string[]
  ) => void;
};
export const SubCollectionsTree: FC<Props> = ({
  collection,
  collectionMap,
  expanded,
  handleToggle
}) => {
  if (!collectionMap || !collectionMap?.children?.length) {
    return <></>;
  }

  const CollapseIcon = () => {
    return (
      <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }}>
        {/* tslint:disable-next-line: max-line-length */}
        <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
      </SvgIcon>
    );
  };

  const ExpandIcon = () => {
    return (
      <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }}>
        {/* tslint:disable-next-line: max-line-length */}
        <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
      </SvgIcon>
    );
  };

  return (
    <div className="collection-items-list-wrapper">
      <div className="mb-3">
        <h2
          className="subcollection-header"
          id="collection-subcollections-section"
        >
          Collection Organization
        </h2>
      </div>

      <SimpleTreeView
        slots={{
          expandIcon: ExpandIcon,
          collapseIcon: CollapseIcon
        }}
        expandedItems={expanded}
        disableSelection
        onExpandedItemsChange={handleToggle}
      >
        <CollectionTreeItem nodes={collectionMap} />
      </SimpleTreeView>
    </div>
  );
};
