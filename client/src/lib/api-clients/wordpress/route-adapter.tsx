/**
 * Unixsee Next.js Route Adapter + Component Registry.
 *
 * Copy this file into your Next.js app, for example:
 *   src/lib/unixsee/route-adapter.tsx
 *
 * This adapter is intentionally UI-framework-light: it only maps Unixsee section
 * contracts to your real React components and provides a safe fallback for
 * unknown sections. Replace the placeholder imports/types with your actual
 * project components.
 */
import {
  UnixseeHomeData,
  UnixseePage,
  UnixseeSection,
} from "@/types/wordpress/unixsee-contracts";
import {
  UnixseeHomeSection,
  UnixseeHomeSectionType,
} from "@/types/wordpress/unixsee-home-sections";
import React from "react";
// import type { UnixseeHomeData, UnixseePage, UnixseeSection } from '../types/unixsee-contracts';
// import type { UnixseeHomeSection, UnixseeHomeSectionType } from '../types/unixsee-home-sections';

export type NextjsComponents = {} & UnixseeSection;

export type UnixseeSectionComponent<
  TSection extends UnixseeSection = UnixseeSection,
> = React.ComponentType<{
  section: TSection;
  cmsProps: TSection["props"];
}>;

export type UnixseeComponentRegistry = Partial<
  Record<UnixseeHomeSectionType, UnixseeSectionComponent<NextjsComponents>>
> & {
  [sectionType: string]: UnixseeSectionComponent<NextjsComponents> | undefined;
};

export type UnixseeRouteAdapterOptions = {
  registry: UnixseeComponentRegistry;
  fallback?: UnixseeSectionComponent;
  onUnknownSection?: (section: UnixseeSection, index: number) => void;
};

export type UnixseeRenderSectionsOptions = UnixseeRouteAdapterOptions & {
  sections: UnixseeSection[];
};

export function createUnixseeRouteAdapter(options: UnixseeRouteAdapterOptions) {
  return {
    renderSections(sections: UnixseeSection[]) {
      return renderUnixseeSections({ ...options, sections });
    },

    renderHome(data: UnixseeHomeData) {
      return renderUnixseeSections({
        ...options,
        sections: data.page.sections,
      });
    },

    assertHomePage(page: UnixseePage) {
      if (page.type !== "home_page") {
        throw new Error(
          `Expected Unixsee home_page, received ${String(page.type)}.`,
        );
      }

      return page as UnixseePage & { sections: UnixseeHomeSection[] };
    },
  };
}

export function renderUnixseeSections(
  options: UnixseeRenderSectionsOptions,
): React.ReactNode[] {
  const Fallback = options.fallback || UnixseeUnknownSection;

  return options.sections.map((section, index) => {
    const Component = options.registry[section.type] || Fallback;

    if (!options.registry[section.type] && options.onUnknownSection) {
      options.onUnknownSection(section, index);
    }

    return React.createElement(Component, {
      key: getSectionKey(section, index),
      section,
      cmsProps: section.props || {},
    });
  });
}

export function getSectionKey(section: UnixseeSection, index: number): string {
  return section.id || `${section.type}-${index}`;
}

export function createHomeRegistry(
  registry: Required<
    Pick<
      UnixseeComponentRegistry,
      | "HomeHeroSection"
      | "HomeProblemSection"
      | "HomeAboutUsSection"
      | "HomeSolutionOverviewSection"
      | "HomeSuccessNumbersSection"
      | "HomeInfrastructureSection"
      | "HomeProcessSection"
      | "HomeTestimonialsSection"
      | "HomeConsultationSection"
      | "HomeFaqSection"
    >
  >,
): UnixseeComponentRegistry {
  return registry;
}

export function UnixseeUnknownSection({
  section,
}: {
  section: UnixseeSection;
  props?: Record<string, unknown>;
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <section
      data-unixsee-unknown-section={section.type}
      style={{ padding: 16, border: "1px dashed #d93025", borderRadius: 12 }}
    >
      <strong>Unknown Unixsee section:</strong> {section.type}
    </section>
  );
}

export type UnixseeRenderPlanEntry = {
  index: number;
  key: string;
  type: string;
  known: boolean;
  entityBacked: boolean;
  source?: string;
  order?: string;
  selectedIds: number[];
  itemCount?: number;
};

export type UnixseeRenderPlan = {
  page: {
    id: number;
    type: string;
    lang: string;
    path: string;
    previewEnabled: boolean;
    usesDraftData: boolean;
    draftUpdatedAt?: string | null;
  };
  sections: UnixseeRenderPlanEntry[];
  unknownSections: string[];
};

export function createUnixseeRenderPlan(
  data: UnixseeHomeData,
  registry: UnixseeComponentRegistry,
): UnixseeRenderPlan {
  const preview = data.page.preview || { enabled: false, usesDraftData: false };

  const sections = data.page.sections.map((section, index) => {
    const props = section.props || {};
    const selectedIds = Array.isArray(props.selectedIds)
      ? props.selectedIds
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isFinite(id))
      : [];
    const items = Array.isArray(props.items) ? props.items : [];
    const entityBacked =
      section.type === "HomeTestimonialsSection" ||
      section.type === "HomeFaqSection";

    return {
      index,
      key: getSectionKey(section, index),
      type: section.type,
      known: Boolean(registry[section.type]),
      entityBacked,
      source: typeof props.source === "string" ? props.source : undefined,
      order: typeof props.order === "string" ? props.order : undefined,
      selectedIds,
      itemCount: entityBacked ? items.length : undefined,
    };
  });

  return {
    page: {
      id: data.page.id,
      type: String(data.page.type),
      lang: String(data.page.lang),
      path: String(data.page.path),
      previewEnabled: Boolean(preview.enabled),
      usesDraftData: Boolean(preview.usesDraftData),
      draftUpdatedAt: preview.draftUpdatedAt ?? null,
    },
    sections,
    unknownSections: sections
      .filter((section) => !section.known)
      .map((section) => section.type),
  };
}
