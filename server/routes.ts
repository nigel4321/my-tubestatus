import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { Journey, JourneyLeg, Disruption } from "@shared/schema";

// TfL API base URL
const TFL_API_BASE = "https://api.tfl.gov.uk";

// Seed map of common station names to ICS codes as fallback
const STATION_SEED_MAP: Record<string, string> = {
  "high barnet": "940GZZLUHBT",
  "chancery lane": "940GZZLUCHL",
  "kings cross": "940GZZLUKSX",
  "leicester square": "940GZZLULCS",
  "oxford circus": "940GZZLUOXC",
};

// In-memory cache for resolved station names
const stationCache = new Map<string, string>();

// Resolve a station name to its TfL ICS code
async function resolveStationToId(stationName: string): Promise<string | null> {
  const normalizedName = stationName.toLowerCase().trim();
  
  // Check cache first
  if (stationCache.has(normalizedName)) {
    console.log(`Using cached ID for ${stationName}: ${stationCache.get(normalizedName)}`);
    return stationCache.get(normalizedName)!;
  }
  
  // Check seed map
  if (STATION_SEED_MAP[normalizedName]) {
    const id = STATION_SEED_MAP[normalizedName];
    console.log(`Using seed map ID for ${stationName}: ${id}`);
    stationCache.set(normalizedName, id);
    return id;
  }
  
  // Query TfL StopPoint Search API
  try {
    const searchUrl = `${TFL_API_BASE}/StopPoint/Search?query=${encodeURIComponent(stationName)}&modes=tube&maxResults=5`;
    console.log(`Searching for station: ${stationName}`);
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error(`StopPoint search failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Filter for tube stations (NaptanMetroStation)
    const tubeStations = (data.matches || []).filter((match: any) => 
      match.modes && match.modes.includes('tube') &&
      (match.icsCode || match.id)
    );
    
    if (tubeStations.length === 0) {
      console.log(`No tube stations found for ${stationName}`);
      return null;
    }
    
    // Prefer matches with stopType NaptanMetroStation
    const metroStation = tubeStations.find((s: any) => 
      s.stopType === 'NaptanMetroStation'
    ) || tubeStations[0];
    
    const stationId = metroStation.icsCode || metroStation.id;
    console.log(`Resolved ${stationName} to station ID: ${stationId} (${metroStation.name})`);
    
    // Cache the result
    stationCache.set(normalizedName, stationId);
    
    return stationId;
  } catch (error) {
    console.error(`Error resolving station ${stationName}:`, error);
    return null;
  }
}

// Map TfL mode names to our simplified mode types
function mapTflMode(tflMode: string): "tube" | "walking" {
  return tflMode === "walking" ? "walking" : "tube";
}

// Extract line name from TfL route options
function extractLineName(leg: any): string | undefined {
  if (leg.mode?.id !== "tube") return undefined;
  return leg.routeOptions?.[0]?.name || leg.mode?.name;
}

// Extract direction from TfL route options
function extractDirection(leg: any): string | undefined {
  if (leg.mode?.id !== "tube") return undefined;
  return leg.routeOptions?.[0]?.directions?.[0];
}

// Determine disruption severity based on TfL status
function mapDisruptionSeverity(statusSeverity: number): "info" | "warning" | "severe" {
  if (statusSeverity >= 10) return "info"; // Good service
  if (statusSeverity >= 6) return "warning"; // Minor delays
  return "severe"; // Severe delays or worse
}

// Transform TfL journey response to our format
function transformTflJourney(tflJourney: any, index: number): Journey {
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
  
  // Check for disruptions in each leg
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

  // If no disruptions found, add good service indicator
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
    isFastest: index === 0, // First journey is typically the fastest
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get journey options from TfL API
  app.get("/api/journeys", async (req, res) => {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({ 
          error: "Both 'from' and 'to' parameters are required" 
        });
      }

      console.log(`Fetching journey data: ${from} to ${to}`);
      
      // Resolve station names to ICS codes
      const fromId = await resolveStationToId(from as string);
      const toId = await resolveStationToId(to as string);
      
      if (!fromId || !toId) {
        console.error(`Failed to resolve stations: from=${fromId}, to=${toId}`);
        return res.status(404).json({ 
          error: "Could not find one or both Underground stations. Please check station names." 
        });
      }
      
      // Call TfL Journey Planner API with resolved station IDs
      const tflUrl = `${TFL_API_BASE}/Journey/JourneyResults/${encodeURIComponent(fromId)}/to/${encodeURIComponent(toId)}?mode=tube,walking`;
      
      console.log(`Calling TfL API with resolved IDs: ${fromId} to ${toId}`);
      
      const response = await fetch(tflUrl);
      
      if (!response.ok) {
        console.error(`TfL API error: ${response.status} ${response.statusText}`);
        return res.status(500).json({ 
          error: "Failed to fetch journey data from TfL API" 
        });
      }

      const data = await response.json();

      // Check if we got a valid journeys response
      if (!data.journeys || data.journeys.length === 0) {
        console.log("No journeys found in TfL response");
        return res.json({ journeys: [] });
      }

      // Transform TfL journeys to our format
      const journeys: Journey[] = (data.journeys || [])
        .slice(0, 5) // Limit to top 5 routes
        .map((journey: any, index: number) => transformTflJourney(journey, index));

      console.log(`Successfully fetched ${journeys.length} journeys from TfL`);
      res.json({ journeys });
    } catch (error) {
      console.error("Error fetching journey data:", error);
      res.status(500).json({ 
        error: "Internal server error while fetching journey data" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
