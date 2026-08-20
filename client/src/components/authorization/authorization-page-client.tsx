"use client";

import { useState } from "react";

import { AuthorizationStatusView } from "@/components/authorization/authorization-status-view";
import { AuthorizationWizard } from "@/components/authorization/authorization-wizard";
import {
  AUTHORIZATION_STATUS,
  canEditAuthorization,
  type AccountContactSeed,
  type AuthorizationCase,
  type AuthorizationStatus,
} from "@/lib/data/authorization/authorization-data";
import {
  applyAuthorizationPreview,
  getRuntimeAuthorizationCase,
  hydrateAuthorizationCase,
  setAuthorizationAccountSeed,
  startAuthorizationDraft,
} from "@/lib/data/authorization/authorization-runtime";

type Mode = "status" | "wizard";

function initializeCase(
  accountContacts: AccountContactSeed,
  initialCase: AuthorizationCase | null,
  previewStatus?: AuthorizationStatus,
) {
  setAuthorizationAccountSeed(accountContacts);
  if (previewStatus) {
    applyAuthorizationPreview(previewStatus);
  } else {
    hydrateAuthorizationCase(initialCase);
  }
  return getRuntimeAuthorizationCase();
}

export function AuthorizationPageClient({
  previewStatus,
  accountContacts,
  initialCase,
}: {
  previewStatus?: AuthorizationStatus;
  accountContacts: AccountContactSeed;
  initialCase: AuthorizationCase | null;
}) {
  const [mode, setMode] = useState<Mode>("status");
  const [authCase, setAuthCase] = useState<AuthorizationCase | null>(() =>
    initializeCase(accountContacts, initialCase, previewStatus),
  );

  function refresh() {
    setAuthCase(getRuntimeAuthorizationCase());
  }

  const status: AuthorizationStatus =
    authCase?.status ?? AUTHORIZATION_STATUS.NOT_STARTED;

  if (mode === "wizard" && canEditAuthorization(status)) {
    const draft = startAuthorizationDraft();
    return (
      <AuthorizationWizard
        initialPackage={draft.package}
        accountContacts={accountContacts}
        staffReason={draft.staffReason}
        onExitToStatus={() => {
          refresh();
          setMode("status");
        }}
        onSubmitted={() => {
          refresh();
          setMode("status");
        }}
      />
    );
  }

  return (
    <AuthorizationStatusView
      status={status}
      authCase={authCase}
      onStart={() => {
        setAuthorizationAccountSeed(accountContacts);
        startAuthorizationDraft();
        refresh();
        setMode("wizard");
      }}
      onContinue={() => {
        setAuthorizationAccountSeed(accountContacts);
        startAuthorizationDraft();
        refresh();
        setMode("wizard");
      }}
    />
  );
}
