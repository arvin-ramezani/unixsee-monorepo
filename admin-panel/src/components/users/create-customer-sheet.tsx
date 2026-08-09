"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type CreateCustomerResultType } from "@/lib/data/users-runtime";
import { CustomerCreateForm } from "./customer-create-form";

type CreateCustomerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: CreateCustomerResultType) => void;
};

export function CreateCustomerSheet({
  open,
  onOpenChange,
  onCreated,
}: CreateCustomerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl"
        aria-describedby="create-customer-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>ایجاد مشتری جدید</SheetTitle>
          <SheetDescription id="create-customer-description">
            مشتری، مستأجر و عضویت مالک با هم ساخته می‌شوند. حساب تا تکمیل
            دعوت‌نامه توسط مشتری تأییدنشده می‌ماند.
          </SheetDescription>
        </SheetHeader>

        {open && (
          <CustomerCreateForm
            key={String(open)}
            onCancel={() => onOpenChange(false)}
            onCreated={(result) => {
              onCreated(result);
              onOpenChange(false);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
