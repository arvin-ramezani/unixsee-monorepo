import { SearchIcon } from "lucide-react";

import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = {
  className?: string;
} & React.ComponentProps<"input">;

export default function SearchInput(props: SearchInputProps) {
  return (
    <div className={cn("relative", props?.className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        // value={query}
        // onChange={(event) => setQuery(event.target.value)}
        // placeholder="جستجو در تیکت، مشتری یا پیام..."
        className="ps-9"
      />
    </div>
  );
}
