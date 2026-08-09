import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  KeyRound,
  Unplug,
} from "lucide-react";

import {
  SERVER_AGENT_STATE,
  SERVER_AGENT_STATE_LABELS,
  type ServerAgentStateType,
} from "@/lib/data/servers-data";
import { cn } from "@/lib/utils";

const SERVER_STATUS_CONFIG: Record<
  ServerAgentStateType,
  { className: string; icon: typeof CheckCircle2 }
> = {
  [SERVER_AGENT_STATE.PENDING_AGENT]: {
    className: "bg-primary/10 text-primary",
    icon: Clock3,
  },
  [SERVER_AGENT_STATE.ENROLLMENT_ISSUED]: {
    className: "bg-secondary/70 text-secondary-foreground",
    icon: KeyRound,
  },
  [SERVER_AGENT_STATE.CONNECTED]: {
    className: "bg-accent/10 text-accent-foreground",
    icon: CheckCircle2,
  },
  [SERVER_AGENT_STATE.STALE]: {
    className: "bg-destructive/10 text-destructive",
    icon: AlertTriangle,
  },
  [SERVER_AGENT_STATE.DISCONNECTED]: {
    className: "bg-muted text-muted-foreground",
    icon: Unplug,
  },
};

type ServerStatusBadgeProps = {
  state: ServerAgentStateType;
  className?: string;
};

export function ServerStatusBadge({ state, className }: ServerStatusBadgeProps) {
  const config = SERVER_STATUS_CONFIG[state];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {SERVER_AGENT_STATE_LABELS[state]}
    </span>
  );
}
