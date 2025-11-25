import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DisruptionAlertProps {
  severity: "info" | "warning" | "severe";
  message: string;
}

export default function DisruptionAlert({
  severity,
  message,
}: DisruptionAlertProps) {
  const config = {
    info: {
      icon: CheckCircle2,
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    warning: {
      icon: Clock,
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    severe: {
      icon: XCircle,
      className: "border-destructive/20 bg-destructive/5 text-destructive",
    },
  };

  const { icon: Icon, className } = config[severity];

  return (
    <Alert className={className} data-testid={`alert-${severity}`}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="text-sm">{message}</AlertDescription>
    </Alert>
  );
}
