import type { ProjectStatus } from "@/types";

import { Badge } from "@/components/ui/badge";

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <Badge variant={status === "ACTIVE" ? "default" : "muted"}>
      {status === "ACTIVE" ? "Active" : "Archived"}
    </Badge>
  );
}
