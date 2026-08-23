"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { RadialRevealLink } from "../common/radial-reveal/radial-reveal-link";
import { cn } from "@/lib/utils";

type NavItem = {
  key: string;
  href: string;
  items?: readonly NavItem[];
  comingSoon?: boolean;
};

type HeaderNavigationProps = {
  items: readonly NavItem[];
};

type TranslateNavigation = (key: string) => string;
type HasNavigationTranslation = (key: string) => boolean;

export function HeaderNavigation({ items }: HeaderNavigationProps) {
  const tNavigation = useTranslations("Layout.Navigation");

  const translate: TranslateNavigation = (key) => tNavigation(key as never);
  const hasTranslation: HasNavigationTranslation = (key) =>
    tNavigation.has(key as never);

  return (
    <NavigationMenu className="relative hidden text-nowrap lg:flex">
      <NavigationMenuList className="border-none! text-xs font-medium xl:text-sm">
        {items.map((item) => (
          <NavigationMenuNode
            key={item.key}
            item={item}
            translate={translate}
            hasTranslation={hasTranslation}
          />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

type NavigationMenuNodeProps = {
  item: NavItem;
  translate: TranslateNavigation;
  hasTranslation: HasNavigationTranslation;
};

function NavigationMenuNode({
  item,
  translate,
  hasTranslation,
}: NavigationMenuNodeProps) {
  const hasChildren = Boolean(item.items?.length);
  const titleKey = `${item.key}.title`;
  const contentTitle = hasTranslation(titleKey)
    ? translate(titleKey)
    : undefined;

  if (!hasChildren) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            href={item.href}
            className="block rounded-md px-2 py-2 font-normal transition-colors focus:bg-transparent xl:px-3 dark:text-white"
          >
            {translate(item.key)}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-transparent px-1 py-2 text-xs focus:bg-transparent xl:px-2 xl:text-sm dark:text-white">
        {!!item.href ? (
          <Link href={item.href}>{translate(`${item.key}.label`)}</Link>
        ) : (
          translate(`${item.key}.label`)
        )}
      </NavigationMenuTrigger>

      <NavigationMenuContent className="p-2" title={contentTitle}>
        <ul className="grid w-sm grid-cols-2 gap-2 p-2">
          {item.items?.map((child) => (
            <NavigationSubItem
              key={child.key}
              item={child}
              parentKey={item.key}
              translate={translate}
            />
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

type NavigationSubItemProps = {
  item: NavItem;
  parentKey: string;
  translate: TranslateNavigation;
};

function NavigationSubItem({
  item,
  parentKey,
  translate,
}: NavigationSubItemProps) {
  const hasChildren = Boolean(item.items?.length);
  const translationKey = `${parentKey}.items.${item.key}`;

  return (
    <li>
      <NavigationMenuLink className="relative hover:bg-transparent" asChild>
        {/* <Link
          href={item.href}
          className="flex flex-col rounded-md border p-3 font-light transition-colors dark:border-[#163d50] dark:hover:bg-[#163d50]"
        >
          <span className="font-light">{translate(translationKey)}</span>
        </Link> */}
        <RadialRevealLink
          href={item.href}
          variant={"outline"}
          revealClassName="bg-accent text-accent-foreground dark:bg-[#163d50]"
          className="hover:text-accent-foreground text-foreground border-border data-[radial-active=true]:text-accent-foreground flex h-11.5 flex-col rounded-md border p-3 font-light transition-colors dark:border-[#163d50]"
        >
          {/* <span className="flex items-center gap-2 font-light"> */}
          {/* <span className="font-light">{translate(translationKey)}</span> */}
          {translate(translationKey)}
          {item.comingSoon && (
            <ComingSoonBadge
              comingSoon
              translate={translate}
              className="absolute inset-e-0 top-0"
            />
          )}
          {/* </span> */}
        </RadialRevealLink>
      </NavigationMenuLink>

      {hasChildren && (
        <ul className="mt-2 space-y-1 ps-3">
          {item.items?.map((child) => (
            <NavigationSubItem
              key={child.key}
              item={child}
              parentKey={`${parentKey}.items.${item.key}`}
              translate={translate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

type NavigationBadgeProps = {
  comingSoon: boolean;
  translate: TranslateNavigation;
  className?: string;
};

function ComingSoonBadge({
  comingSoon,
  translate,
  className,
}: NavigationBadgeProps) {
  if (!comingSoon) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "min-h-4 shrink-0 rounded-full px-1.5 py-0 text-[10px] leading-none font-semibold",
        className,
      )}
    >
      {translate("comingSoon")}
    </Badge>
  );
}
