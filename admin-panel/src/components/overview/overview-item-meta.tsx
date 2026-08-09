import {
  OVERVIEW_ITEM_TYPE_LABELS,
  type OverviewAttentionItemType,
} from "@/lib/data/overview-data";

type OverviewItemMetaProps = {
  item: OverviewAttentionItemType;
};

export function OverviewItemMeta({ item }: OverviewItemMetaProps) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span>{OVERVIEW_ITEM_TYPE_LABELS[item.type]}</span>
      {item.customerName ? <span>{item.customerName}</span> : null}
      <span>{item.ageLabel}</span>
      {item.slaHint ? (
        <span className="font-medium text-amber-700 dark:text-amber-300">
          {item.slaHint}
        </span>
      ) : null}
    </div>
  );
}
