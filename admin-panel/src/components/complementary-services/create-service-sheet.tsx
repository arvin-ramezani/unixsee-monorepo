"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Globe2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPLEMENTARY_SERVICE_FAMILY_LABELS,
  COMPLEMENTARY_SERVICE_OWNERS,
  SERVICE_COMMERCIAL_MODEL,
  SERVICE_COMMERCIAL_MODEL_LABELS,
  type ComplementaryServiceRequestType,
  type ServiceCommercialModelType,
} from "@/lib/data/complementary-services-data";

type CreateServiceValues = {
  ownerName: string;
  commercialModel: ServiceCommercialModelType;
  startDate: string;
  agreedAmount: string;
  scope: string;
  exclusions: string;
};

type CreateServiceSheetProps = {
  open: boolean;
  request: ComplementaryServiceRequestType | null;
  hasDuplicateAssignment: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    request: ComplementaryServiceRequestType,
    values: CreateServiceValues,
  ) => void;
};

const COMMERCIAL_MODEL_OPTIONS = Object.values(SERVICE_COMMERCIAL_MODEL);

function CreateServiceForm({
  request,
  hasDuplicateAssignment,
  onCancel,
  onCreate,
}: {
  request: ComplementaryServiceRequestType;
  hasDuplicateAssignment: boolean;
  onCancel: () => void;
  onCreate: CreateServiceSheetProps["onCreate"];
}) {
  const [ownerName, setOwnerName] = useState(
    request.ownerName ?? COMPLEMENTARY_SERVICE_OWNERS[0],
  );
  const [commercialModel, setCommercialModel] =
    useState<ServiceCommercialModelType>(SERVICE_COMMERCIAL_MODEL.CUSTOM_QUOTE);
  const [startDate, setStartDate] = useState("");
  const [agreedAmount, setAgreedAmount] = useState("");
  const [scope, setScope] = useState(request.description);
  const [exclusions, setExclusions] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate(request, {
      ownerName,
      commercialModel,
      startDate,
      agreedAmount,
      scope,
      exclusions,
    });
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe2 className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">{request.websiteTitle}</p>
              <p
                className="mt-1 truncate text-sm text-muted-foreground w-fit"
                dir="ltr"
              >
                {request.websiteDomain}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {request.customerName} · درخواست {request.id}
              </p>
            </div>
          </div>
        </div>

        {hasDuplicateAssignment && (
          <div
            className="flex items-start gap-2 rounded-xl border border-accent bg-accent/20 p-3 text-sm text-accent-foreground"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              برای این وب‌سایت یک سرویس هم‌نوع وجود دارد. پیش از ثبت، سابقه
              سرویس را بررسی کنید.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="service-title" className="text-sm font-medium">
            عنوان سرویس
          </label>
          <Input id="service-title" value={request.title} readOnly />
          <p className="text-xs text-muted-foreground">
            {COMPLEMENTARY_SERVICE_FAMILY_LABELS[request.family]}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="service-owner" className="text-sm font-medium">
              مسئول سرویس
            </label>
            <Select
              value={ownerName}
              onValueChange={(value) => value && setOwnerName(value)}
            >
              <SelectTrigger id="service-owner" className="w-full">
                <SelectValue>{ownerName}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {COMPLEMENTARY_SERVICE_OWNERS.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="commercial-model" className="text-sm font-medium">
              مدل همکاری
            </label>
            <Select
              value={commercialModel}
              onValueChange={(value) =>
                value && setCommercialModel(value as ServiceCommercialModelType)
              }
            >
              <SelectTrigger id="commercial-model" className="w-full">
                <SelectValue>
                  {SERVICE_COMMERCIAL_MODEL_LABELS[commercialModel]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {COMMERCIAL_MODEL_OPTIONS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {SERVICE_COMMERCIAL_MODEL_LABELS[model]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="service-start-date" className="text-sm font-medium">
              تاریخ شروع
            </label>
            <Input
              id="service-start-date"
              type="date"
              dir="ltr"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="agreed-amount" className="text-sm font-medium">
              مبلغ توافق‌شده
            </label>
            <Input
              id="agreed-amount"
              value={agreedAmount}
              onChange={(event) => setAgreedAmount(event.target.value)}
              placeholder="مثلاً ۲۵٬۰۰۰٬۰۰۰ تومان"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="service-scope" className="text-sm font-medium">
            محدوده مورد توافق
          </label>
          <Textarea
            id="service-scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="min-h-28"
            required
          />
          <p className="text-xs text-muted-foreground">
            فقط موارد تأییدشده مشتری را در محدوده سرویس وارد کنید.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="service-exclusions" className="text-sm font-medium">
            موارد خارج از محدوده
          </label>
          <Textarea
            id="service-exclusions"
            value={exclusions}
            onChange={(event) => setExclusions(event.target.value)}
            placeholder="مواردی که در این توافق انجام نمی‌شوند"
          />
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">
            با ثبت این فرم، درخواست به یک سرویس زمان‌بندی‌شده برای همین وب‌سایت
            تبدیل می‌شود. این رفتار فعلاً فقط در داده‌های نمایشی صفحه اعمال
            می‌شود.
          </p>
        </div>
      </div>

      <SheetFooter className="border-t border-border bg-card">
        <Button type="submit">ایجاد سرویس</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </SheetFooter>
    </form>
  );
}

export function CreateServiceSheet({
  open,
  request,
  hasDuplicateAssignment,
  onOpenChange,
  onCreate,
}: CreateServiceSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-2xl"
        aria-describedby="create-service-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>ایجاد سرویس تکمیلی</SheetTitle>
          <SheetDescription id="create-service-description">
            اطلاعات توافق را بازبینی و سرویس را برای وب‌سایت درخواست‌شده ایجاد
            کنید.
          </SheetDescription>
        </SheetHeader>

        {request && (
          <CreateServiceForm
            key={request.id}
            request={request}
            hasDuplicateAssignment={hasDuplicateAssignment}
            onCancel={() => onOpenChange(false)}
            onCreate={onCreate}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
