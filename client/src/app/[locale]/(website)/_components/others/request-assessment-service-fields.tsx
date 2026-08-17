"use client";

import type { Control } from "react-hook-form";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  DATA_ENTRY_WORK_VALUES,
  DATA_SOURCE_VALUES,
  DATABASE_BANDS,
  ASPECT_RATIO_VALUES,
  DESIGN_COUNT_BANDS,
  DESIGN_TYPE_VALUES,
  HOSTING_TYPE_VALUES,
  ITEM_COUNT_BANDS,
  LAUNCH_TIME_BANDS,
  DAILY_VISITOR_BANDS,
  ORDER_COUNT_BANDS,
  POST_COUNT_BANDS,
  PRODUCT_COUNT_BANDS,
  SEO_GOAL_VALUES,
  SOCIAL_PLATFORM_VALUES,
  STORAGE_BANDS,
  type RequestAssessmentSchemaType,
  type ServiceValue,
} from "@/lib/zod-schemas/request-assessment-schema";

import {
  MultiSelectFormField,
  SelectFormField,
  ServiceSection,
  TextareaFormField,
  TextFormField,
  UrlListFormField,
  YesNoFormField,
  type TranslateError,
} from "./request-assessment-form-fields";

type ServiceFieldsProps = {
  control: Control<RequestAssessmentSchemaType>;
  disabled?: boolean;
  translateError: TranslateError;
  service: ServiceValue;
};

const enterEase = [0.22, 1, 0.36, 1] as const;

function AnimatedServicePanel({
  serviceKey,
  children,
}: {
  serviceKey: string;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={serviceKey}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1, transition: { duration: 0.15 } }
          : {
              opacity: 1,
              y: 0,
              transition: { duration: 0.28, ease: enterEase },
            }
      }
      exit={
        prefersReducedMotion
          ? { opacity: 0, transition: { duration: 0.12 } }
          : { opacity: 0, y: -8, transition: { duration: 0.18 } }
      }
    >
      {children}
    </motion.div>
  );
}

function ManagedServerFields({
  control,
  disabled,
  translateError,
}: Omit<ServiceFieldsProps, "service">) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.services.managedServer",
  );
  const tOptions = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.options",
  );

  const optionLabel = (group: string, value: string) =>
    tOptions(`${group}.${value}` as "cms.wordpress");

  const { setValue, clearErrors } = useFormContext<RequestAssessmentSchemaType>();

  const hasActiveWebsite = useWatch({
    control,
    name: "serviceDetails.hasActiveWebsite",
  });
  const hasPeakTraffic = useWatch({
    control,
    name: "serviceDetails.hasPeakTraffic",
  });

  useEffect(() => {
    if (hasPeakTraffic === "no") {
      setValue("serviceDetails.peakTrafficDetails", "");
      clearErrors(["serviceDetails.peakTrafficDetails"]);
    }
  }, [clearErrors, hasPeakTraffic, setValue]);

  useEffect(() => {
    if (hasActiveWebsite === "no") {
      setValue("serviceDetails.websiteUrl", "");
      setValue("serviceDetails.cms", undefined);
      setValue("serviceDetails.currentHosting", "");
      setValue("serviceDetails.currentServiceType", undefined);
      setValue("serviceDetails.storageUsage", undefined);
      setValue("serviceDetails.databaseSize", undefined);
      setValue("serviceDetails.monthlyVisits", undefined);
      setValue("serviceDetails.hasWooCommerce", undefined);
      setValue("serviceDetails.hasPeakTraffic", undefined);
      setValue("serviceDetails.peakTrafficDetails", "");
      setValue("serviceDetails.managedServerAdditionalDetails", "");
      clearErrors([
        "serviceDetails.websiteUrl",
        "serviceDetails.cms",
        "serviceDetails.currentHosting",
        "serviceDetails.currentServiceType",
        "serviceDetails.storageUsage",
        "serviceDetails.databaseSize",
        "serviceDetails.monthlyVisits",
        "serviceDetails.hasWooCommerce",
        "serviceDetails.hasPeakTraffic",
        "serviceDetails.peakTrafficDetails",
        "serviceDetails.managedServerAdditionalDetails",
      ]);
      return;
    }

    if (hasActiveWebsite === "yes") {
      setValue("serviceDetails.projectType", undefined);
      setValue("serviceDetails.expectedTraffic", undefined);
      setValue("serviceDetails.expectedStorage", undefined);
      setValue("serviceDetails.willUseWooCommerce", undefined);
      setValue("serviceDetails.expectedLaunchTime", undefined);
      clearErrors([
        "serviceDetails.projectType",
        "serviceDetails.expectedTraffic",
        "serviceDetails.expectedStorage",
        "serviceDetails.willUseWooCommerce",
        "serviceDetails.expectedLaunchTime",
      ]);
    }
  }, [clearErrors, hasActiveWebsite, setValue]);

  const existingSiteDisabled = disabled || hasActiveWebsite !== "yes";

  return (
    <ServiceSection title={t("title")}>
      <YesNoFormField
        control={control}
        name="serviceDetails.hasActiveWebsite"
        label={t("hasActiveWebsite")}
        required
        disabled={disabled}
        translateError={translateError}
      />

      {hasActiveWebsite === "yes" && (
        <>
          <TextFormField
            control={control}
            name="serviceDetails.websiteUrl"
            label={t("websiteUrl")}
            required
            disabled={existingSiteDisabled}
            translateError={translateError}
            placeholder={t("websiteUrlPlaceholder")}
            type="url"
            dir="ltr"
          />
          <TextFormField
            control={control}
            name="serviceDetails.currentHosting"
            label={t("currentHosting")}
            disabled={existingSiteDisabled}
            translateError={translateError}
            placeholder={t("currentHostingPlaceholder")}
          />
          <SelectFormField
            control={control}
            name="serviceDetails.currentServiceType"
            label={t("currentServiceType")}
            required
            disabled={existingSiteDisabled}
            translateError={translateError}
            placeholder={t("selectPlaceholder")}
            options={HOSTING_TYPE_VALUES}
            optionLabel={(value) => optionLabel("hostingType", value)}
          />
          <SelectFormField
            control={control}
            name="serviceDetails.storageUsage"
            label={t("storageUsage")}
            required
            disabled={existingSiteDisabled}
            translateError={translateError}
            placeholder={t("selectPlaceholder")}
            options={STORAGE_BANDS}
            optionLabel={(value) => optionLabel("storage", value)}
          />
          <SelectFormField
            control={control}
            name="serviceDetails.databaseSize"
            label={t("databaseSize")}
            required
            disabled={existingSiteDisabled}
            translateError={translateError}
            placeholder={t("selectPlaceholder")}
            options={DATABASE_BANDS}
            optionLabel={(value) => optionLabel("database", value)}
          />
          <SelectFormField
            control={control}
            name="serviceDetails.monthlyVisits"
            label={t("monthlyVisits")}
            required
            disabled={existingSiteDisabled}
            translateError={translateError}
            placeholder={t("selectPlaceholder")}
            options={DAILY_VISITOR_BANDS}
            optionLabel={(value) => optionLabel("dailyVisits", value)}
          />
          <YesNoFormField
            control={control}
            name="serviceDetails.hasPeakTraffic"
            label={t("hasPeakTraffic")}
            required
            disabled={existingSiteDisabled}
            translateError={translateError}
          />
          {hasPeakTraffic === "yes" && (
            <TextFormField
              control={control}
              name="serviceDetails.peakTrafficDetails"
              label={t("peakTrafficDetails")}
              disabled={existingSiteDisabled}
              translateError={translateError}
              placeholder={t("peakTrafficDetailsPlaceholder")}
            />
          )}
          <TextareaFormField
            control={control}
            name="serviceDetails.managedServerAdditionalDetails"
            label={t("additionalDetails")}
            disabled={existingSiteDisabled}
            translateError={translateError}
            placeholder={t("additionalDetailsPlaceholder")}
          />
        </>
      )}
    </ServiceSection>
  );
}

function WooCommerceSupportFields({
  control,
  disabled,
  translateError,
}: Omit<ServiceFieldsProps, "service">) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.services.woocommerceSupport",
  );
  const tOptions = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.options",
  );

  const optionLabel = (group: string, value: string) =>
    tOptions(`${group}.${value}` as "cms.wordpress");

  const { setValue, clearErrors } = useFormContext<RequestAssessmentSchemaType>();

  const storeActive = useWatch({
    control,
    name: "serviceDetails.storeActive",
  });
  const hasUrgentIssue = useWatch({
    control,
    name: "serviceDetails.hasUrgentIssue",
  });

  useEffect(() => {
    if (storeActive === "no") {
      setValue("serviceDetails.productCount", undefined);
      setValue("serviceDetails.monthlyOrders", undefined);
      setValue("serviceDetails.wcMonthlyVisits", undefined);
      clearErrors([
        "serviceDetails.productCount",
        "serviceDetails.monthlyOrders",
        "serviceDetails.wcMonthlyVisits",
      ]);
    }
  }, [clearErrors, setValue, storeActive]);

  useEffect(() => {
    if (hasUrgentIssue === "no") {
      setValue("serviceDetails.issueDescription", "");
      clearErrors(["serviceDetails.issueDescription"]);
    }
  }, [clearErrors, hasUrgentIssue, setValue]);

  return (
    <ServiceSection title={t("title")}>
      <TextFormField
        control={control}
        name="serviceDetails.storeUrl"
        label={t("storeUrl")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("storeUrlPlaceholder")}
        type="url"
        dir="ltr"
      />
      <YesNoFormField
        control={control}
        name="serviceDetails.storeActive"
        label={t("storeActive")}
        required
        disabled={disabled}
        translateError={translateError}
      />
      {storeActive === "yes" && (
        <>
          <SelectFormField
            control={control}
            name="serviceDetails.productCount"
            label={t("productCount")}
            required
            disabled={disabled}
            translateError={translateError}
            placeholder={t("selectPlaceholder")}
            options={PRODUCT_COUNT_BANDS}
            optionLabel={(value) => optionLabel("productCount", value)}
          />
          <SelectFormField
            control={control}
            name="serviceDetails.monthlyOrders"
            label={t("monthlyOrders")}
            required
            disabled={disabled}
            translateError={translateError}
            placeholder={t("selectPlaceholder")}
            options={ORDER_COUNT_BANDS}
            optionLabel={(value) => optionLabel("orderCount", value)}
          />
          <SelectFormField
            control={control}
            name="serviceDetails.wcMonthlyVisits"
            label={t("monthlyVisits")}
            required
            disabled={disabled}
            translateError={translateError}
            placeholder={t("selectPlaceholder")}
            options={DAILY_VISITOR_BANDS}
            optionLabel={(value) => optionLabel("dailyVisits", value)}
          />
        </>
      )}
      <YesNoFormField
        control={control}
        name="serviceDetails.hasUrgentIssue"
        label={t("hasUrgentIssue")}
        required
        disabled={disabled}
        translateError={translateError}
      />
      {hasUrgentIssue === "yes" && (
        <TextareaFormField
          control={control}
          name="serviceDetails.issueDescription"
          label={t("issueDescription")}
          required
          disabled={disabled}
          translateError={translateError}
          placeholder={t("issueDescriptionPlaceholder")}
        />
      )}
    </ServiceSection>
  );
}

function SeoFields({
  control,
  disabled,
  translateError,
}: Omit<ServiceFieldsProps, "service">) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.services.seo",
  );
  const tOptions = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.options",
  );

  const optionLabel = (group: string, value: string) =>
    tOptions(`${group}.${value}` as "cms.wordpress");

  return (
    <ServiceSection title={t("title")}>
      <TextFormField
        control={control}
        name="serviceDetails.seoWebsiteUrl"
        label={t("websiteUrl")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("websiteUrlPlaceholder")}
        type="url"
        dir="ltr"
      />
      <TextFormField
        control={control}
        name="serviceDetails.businessArea"
        label={t("businessArea")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("businessAreaPlaceholder")}
      />
      <SelectFormField
        control={control}
        name="serviceDetails.mainGoal"
        label={t("mainGoal")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("selectPlaceholder")}
        options={SEO_GOAL_VALUES}
        optionLabel={(value) => optionLabel("seoGoals", value)}
      />
      <TextFormField
        control={control}
        name="serviceDetails.targetCountry"
        label={t("targetCountry")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("targetCountryPlaceholder")}
      />
      <TextFormField
        control={control}
        name="serviceDetails.targetLanguages"
        label={t("targetLanguages")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("targetLanguagesPlaceholder")}
      />
      <SelectFormField
        control={control}
        name="serviceDetails.organicTraffic"
        label={t("organicTraffic")}
        disabled={disabled}
        translateError={translateError}
        placeholder={t("selectPlaceholder")}
        options={DAILY_VISITOR_BANDS}
        optionLabel={(value) => optionLabel("dailyVisits", value)}
      />
    </ServiceSection>
  );
}

function GraphicDesignFields({
  control,
  disabled,
  translateError,
}: Omit<ServiceFieldsProps, "service">) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.services.graphicDesign",
  );
  const tOptions = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.options",
  );

  const optionLabel = (group: string, value: string) =>
    tOptions(`${group}.${value}` as "cms.wordpress");

  return (
    <ServiceSection title={t("title")}>
      <MultiSelectFormField
        control={control}
        name="serviceDetails.designTypes"
        label={t("designTypes")}
        required
        disabled={disabled}
        translateError={translateError}
        options={DESIGN_TYPE_VALUES}
        optionLabel={(value) => optionLabel("designTypes", value)}
      />
      <SelectFormField
        control={control}
        name="serviceDetails.designCount"
        label={t("designCount")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("selectPlaceholder")}
        options={DESIGN_COUNT_BANDS}
        optionLabel={(value) => optionLabel("designCount", value)}
      />
      <MultiSelectFormField
        control={control}
        name="serviceDetails.dimensionsOrPlatform"
        label={t("dimensionsOrPlatform")}
        disabled={disabled}
        translateError={translateError}
        options={ASPECT_RATIO_VALUES}
        optionLabel={(value) => optionLabel("aspectRatios", value)}
      />
      <YesNoFormField
        control={control}
        name="serviceDetails.hasBrandGuideline"
        label={t("hasBrandGuideline")}
        required
        disabled={disabled}
        translateError={translateError}
      />
      <YesNoFormField
        control={control}
        name="serviceDetails.contentReady"
        label={t("contentReady")}
        required
        disabled={disabled}
        translateError={translateError}
      />
    </ServiceSection>
  );
}

function ProductDataEntryFields({
  control,
  disabled,
  translateError,
}: Omit<ServiceFieldsProps, "service">) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.services.productDataEntry",
  );
  const tOptions = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.options",
  );

  const optionLabel = (group: string, value: string) =>
    tOptions(`${group}.${value}` as "cms.wordpress");

  return (
    <ServiceSection title={t("title")}>
      <TextFormField
        control={control}
        name="serviceDetails.dataEntryWebsiteUrl"
        label={t("websiteUrl")}
        disabled={disabled}
        translateError={translateError}
        placeholder={t("websiteUrlPlaceholder")}
        type="url"
        dir="ltr"
      />
      <SelectFormField
        control={control}
        name="serviceDetails.workType"
        label={t("workType")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("selectPlaceholder")}
        options={DATA_ENTRY_WORK_VALUES}
        optionLabel={(value) => optionLabel("dataEntryWork", value)}
      />
      <SelectFormField
        control={control}
        name="serviceDetails.itemCount"
        label={t("itemCount")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("selectPlaceholder")}
        options={ITEM_COUNT_BANDS}
        optionLabel={(value) => optionLabel("itemCount", value)}
      />
      <MultiSelectFormField
        control={control}
        name="serviceDetails.dataSources"
        label={t("dataSources")}
        required
        disabled={disabled}
        translateError={translateError}
        options={DATA_SOURCE_VALUES}
        optionLabel={(value) => optionLabel("dataSources", value)}
      />
      <TextFormField
        control={control}
        name="serviceDetails.contentLanguage"
        label={t("contentLanguage")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("contentLanguagePlaceholder")}
      />
      <YesNoFormField
        control={control}
        name="serviceDetails.needsImageProcessing"
        label={t("needsImageProcessing")}
        required
        disabled={disabled}
        translateError={translateError}
      />
      <TextareaFormField
        control={control}
        name="serviceDetails.specialInstructions"
        label={t("specialInstructions")}
        disabled={disabled}
        translateError={translateError}
        placeholder={t("specialInstructionsPlaceholder")}
      />
    </ServiceSection>
  );
}

function SocialMediaFields({
  control,
  disabled,
  translateError,
}: Omit<ServiceFieldsProps, "service">) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.services.socialMedia",
  );
  const tOptions = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.options",
  );

  const optionLabel = (group: string, value: string) =>
    tOptions(`${group}.${value}` as "cms.wordpress");

  return (
    <ServiceSection title={t("title")}>
      <MultiSelectFormField
        control={control}
        name="serviceDetails.platforms"
        label={t("platforms")}
        required
        disabled={disabled}
        translateError={translateError}
        options={SOCIAL_PLATFORM_VALUES}
        optionLabel={(value) => optionLabel("socialPlatforms", value)}
      />
      <UrlListFormField
        control={control}
        name="serviceDetails.accountLinks"
        label={t("accountLinks")}
        disabled={disabled}
        translateError={translateError}
        placeholder={t("accountLinksPlaceholder")}
        addLabel={t("addLink")}
        removeLabel={t("removeLink")}
      />
      <TextFormField
        control={control}
        name="serviceDetails.targetMarket"
        label={t("targetMarket")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("targetMarketPlaceholder")}
      />
      <SelectFormField
        control={control}
        name="serviceDetails.monthlyPosts"
        label={t("monthlyPosts")}
        required
        disabled={disabled}
        translateError={translateError}
        placeholder={t("selectPlaceholder")}
        options={POST_COUNT_BANDS}
        optionLabel={(value) => optionLabel("postCount", value)}
      />
      <YesNoFormField
        control={control}
        name="serviceDetails.needsGraphicDesign"
        label={t("needsGraphicDesign")}
        required
        disabled={disabled}
        translateError={translateError}
      />
      <YesNoFormField
        control={control}
        name="serviceDetails.needsCommunityManagement"
        label={t("needsCommunityManagement")}
        required
        disabled={disabled}
        translateError={translateError}
      />
      <YesNoFormField
        control={control}
        name="serviceDetails.needsAdManagement"
        label={t("needsAdManagement")}
        required
        disabled={disabled}
        translateError={translateError}
      />
      <TextareaFormField
        control={control}
        name="serviceDetails.socialAdditionalDetails"
        label={t("additionalDetails")}
        disabled={disabled}
        translateError={translateError}
        placeholder={t("additionalDetailsPlaceholder")}
      />
    </ServiceSection>
  );
}

function renderServiceFields(props: ServiceFieldsProps) {
  switch (props.service) {
    case "managedServer":
      return <ManagedServerFields {...props} />;
    case "woocommerceSupport":
      return <WooCommerceSupportFields {...props} />;
    case "seo":
      return <SeoFields {...props} />;
    case "graphicDesign":
      return <GraphicDesignFields {...props} />;
    case "productDataEntry":
      return <ProductDataEntryFields {...props} />;
    case "socialMedia":
      return <SocialMediaFields {...props} />;
    default:
      return null;
  }
}

export function RequestAssessmentServiceFields({
  control,
  disabled,
  translateError,
  service,
}: ServiceFieldsProps) {
  return (
    <AnimatePresence mode="wait">
      {!!service && (
        <AnimatedServicePanel serviceKey={service}>
          {renderServiceFields({
            control,
            disabled,
            translateError,
            service,
          })}
        </AnimatedServicePanel>
      )}
    </AnimatePresence>
  );
}
