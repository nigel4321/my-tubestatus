import type { Journey, JourneyLeg, Disruption } from "@shared/schema";

export const TFL_API_BASE = "https://api.tfl.gov.uk";

export const STATION_SEED_MAP: Record<string, string> = {
  "high barnet": "940GZZLUHBT",
  "chancery lane": "940GZZLUCHL",
  "kings cross": "940GZZLUKSX",
  "leicester square": "940GZZLULCS",
  "oxford circus": "940GZZLUOXC",
};

export const stationCache = new Map<string, string>();

export function mapTflMode(tflMode: string): "tube" | "walking" {
  return tflMode === "walking" ? "walking" : "tube";
}

export function extractLineName(leg: any): string | undefined {
  if (leg.mode?.id !== "tube") return undefined;
  return leg.routeOptions?.[0]?.name || leg.mode?.name;
}

export function extractDirection(leg: any): string | undefined {
  if (leg.mode?.id !== "tube") return undefined;
  return leg.routeOptions?.[0]?.directions?.[0];
}

export function mapDisruptionSeverity(statusSeverity: number): "info" | "warning" | "severe" {
  if (statusSeverity >= 10) return "info";
  if (statusSeverity >= 6) return "warning";
  return "severe";
}

export function transformTflJourney(tflJourney: any, index: number): Journey {
  const legs: JourneyLeg[] = tflJourney.legs.map((leg: any) => ({
    mode: mapTflMode(leg.mode?.id || "walking"),
    lineName: extractLineName(leg),
    direction: extractDirection(leg),
    from: leg.departurePoint?.commonName || "",
    to: leg.arrivalPoint?.commonName || "",
    duration: leg.duration || 0,
    stops: leg.mode?.id === "tube" ? (leg.path?.stopPoints?.length || 0) : undefined,
    distance: leg.mode?.id === "walking" ? Math.round(leg.distance || 0) : undefined,
  }));

  const disruptions: Disruption[] = [];
  
  tflJourney.legs.forEach((leg: any) => {
    if (leg.disruptions && leg.disruptions.length > 0) {
      leg.disruptions.forEach((disruption: any) => {
        disruptions.push({
          severity: "warning",
          message: disruption.description || "Service disruption",
        });
      });
    }
  });

  if (disruptions.length === 0) {
    disruptions.push({
      severity: "info",
      message: "Good service on all lines",
    });
  }

  const departureTime = new Date(tflJourney.startDateTime);
  const arrivalTime = new Date(tflJourney.arrivalDateTime);

  return {
    duration: tflJourney.duration || 0,
    departureTime: departureTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    arrivalTime: arrivalTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    legs,
    disruptions,
    isFastest: index === 0,
  };
}

export async function resolveStationToId(stationName: string): Promise<string | null> {
  const normalizedName = stationName.toLowerCase().trim();
  
  if (stationCache.has(normalizedName)) {
    return stationCache.get(normalizedName)!;
  }
  
  if (STATION_SEED_MAP[normalizedName]) {
    const id = STATION_SEED_MAP[normalizedName];
    stationCache.set(normalizedName, id);
    return id;
  }
  
  try {
    const searchUrl = `${TFL_API_BASE}/StopPoint/Search?query=${encodeURIComponent(stationName)}&modes=tube&maxResults=5`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    const tubeStations = (data.matches || []).filter((match: any) => 
      match.modes && match.modes.includes('tube') &&
      (match.icsCode || match.id)
    );
    
    if (tubeStations.length === 0) {
      return null;
    }
    
    const metroStation = tubeStations.find((s: any) => 
      s.stopType === 'NaptanMetroStation'
    ) || tubeStations[0];
    
    const stationId = metroStation.icsCode || metroStation.id;
    stationCache.set(normalizedName, stationId);
    
    return stationId;
  } catch (error) {
    return null;
  }
}

export function clearStationCache(): void {
  stationCache.clear();
}
