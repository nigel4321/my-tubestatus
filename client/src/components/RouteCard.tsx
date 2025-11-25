import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import JourneyLeg from "./JourneyLeg";
import DisruptionAlert from "./DisruptionAlert";
import LineSummary from "./LineSummary";
import { useState } from "react";

interface RouteCardProps {
  duration: number;
  departureTime: string;
  arrivalTime: string;
  legs: Array<{
    mode: "tube" | "walking";
    lineName?: string;
    direction?: string;
    from: string;
    to: string;
    duration: number;
    stops?: number;
    distance?: number;
  }>;
  disruptions?: Array<{
    severity: "info" | "warning" | "severe";
    message: string;
  }>;
  isFastest?: boolean;
}

export default function RouteCard({
  duration,
  departureTime,
  arrivalTime,
  legs,
  disruptions = [],
  isFastest = false,
}: RouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tubeLines = Array.from(
    new Set(
      legs
        .filter((leg) => leg.mode === "tube" && leg.lineName)
        .map((leg) => leg.lineName!)
    )
  );

  return (
    <Card
      className={`hover-elevate ${isFastest ? "border-primary/30 bg-primary/5" : ""}`}
      data-testid="card-route"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-semibold" data-testid="text-duration">
                  {duration} min
                </span>
                {isFastest && (
                  <Badge variant="secondary" className="text-xs">
                    Fastest
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
              <div className="font-medium" data-testid="text-departure">
                {departureTime}
              </div>
              <div className="text-xs text-muted-foreground">Depart</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-right">
              <div className="font-medium" data-testid="text-arrival">
                {arrivalTime}
              </div>
              <div className="text-xs text-muted-foreground">Arrive</div>
            </div>
          </div>
        </div>
        <LineSummary lines={tubeLines} />
      </CardHeader>
      <CardContent className="space-y-4">
        {disruptions.length > 0 && (
          <div className="space-y-2">
            {disruptions.map((disruption, index) => (
              <DisruptionAlert
                key={index}
                severity={disruption.severity}
                message={disruption.message}
              />
            ))}
          </div>
        )}
        
        {isExpanded && (
          <div className="space-y-4 pt-2">
            {legs.map((leg, index) => (
              <JourneyLeg key={index} {...leg} />
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid="button-expand-route"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show {legs.length} steps
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
