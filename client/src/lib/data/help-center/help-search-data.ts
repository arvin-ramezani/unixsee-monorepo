/**
 * Help Center search fixtures.
 *
 * Structure-only, deterministic search indices for the featured Help Center
 * search experience. Copy (titles, descriptions) stays in next-intl messages
 * and is resolved at the route/composition boundary into the view models the
 * client search component consumes — never inside presentation.
 *
 * These fixtures back a dummy client-side filter. Real search is expected to
 * replace the client filter with a backend call at the marked boundaries.
 *
 * // TODO: Fetch topics from Help Center API
 * // TODO: Fetch article search results from backend
 */

import {
  helpArticleIndex,
  helpTopics,
  type HelpArticleType,
  type HelpTopicKey,
} from "./help-center-data";

/** A topic entry in the search dropdown (focus + typing states). */
export interface HelpSearchTopicSource {
  id: string;
  key: HelpTopicKey;
  href: string;
}

/** An article entry surfaced while typing. */
export interface HelpSearchArticleSource {
  id: string;
  topicId: string;
  topicKey: HelpTopicKey;
  articleKey: string;
  type: HelpArticleType;
  href: string;
}

/**
 * Every topic, in approved order. Shown first in the focus state and mixed with
 * article matches while typing (topic matches rank below article matches).
 */
export const helpSearchTopics: HelpSearchTopicSource[] = helpTopics.map(
  (topic) => ({
    id: topic.id,
    key: topic.key,
    href: `/dashboard/help-center/topics/${topic.id}`,
  }),
);

/**
 * Canonical article index for the typing state. Derived from the existing flat
 * article index so every suggestion resolves to a real article route.
 */
export const helpSearchArticles: HelpSearchArticleSource[] =
  helpArticleIndex.map((loc) => ({
    id: `${loc.topic.id}/${loc.slug}`,
    topicId: loc.topic.id,
    topicKey: loc.topic.key,
    articleKey: loc.article.key,
    type: loc.article.type,
    href: `/dashboard/help-center/topics/${loc.topic.id}/${loc.slug}`,
  }));
