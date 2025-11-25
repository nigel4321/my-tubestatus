import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import JourneyHeader from "@/components/JourneyHeader";
import RouteCard from "@/components/RouteCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import type { Journey } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [from, setFrom] = useState("High Barnet");
  const [to, setTo] = useState("Chancery Lane");
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [canRefresh, setCanRefresh] = useState(true);

  // Fetch journey data from our backend API
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery<{ journeys: Journey[] }>({
    queryKey: ["/api/journeys", from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(`/api/journeys?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch journey data");
      }
      
      return response.json();
    },
    refetchInterval: 120000, // Auto-refresh every 2 minutes
    staleTime: 30000, // Data considered fresh for 30 seconds
  });

  const routes = data?.journeys || [];
  const lastUpdated = data && dataUpdatedAt ? new Date(dataUpdatedAt) : undefined;

  // Rate limiting - re-enable refresh button after 30 seconds
  useEffect(() => {
    if (!canRefresh) {
      const timer = setTimeout(() => {
        setCanRefresh(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [canRefresh]);

  // Handle manual refresh with rate limiting
  const handleRefresh = async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    
    // Enforce 30 second rate limit
    if (timeSinceLastRefresh < 30000) {
      console.log(`Please wait ${Math.ceil((30000 - timeSinceLastRefresh) / 1000)} seconds before refreshing again`);
      return;
    }

    setCanRefresh(false);
    setLastRefreshTime(now);
    console.log("Refreshing journey data from TfL API...");
    
    await refetch();
  };

  // Handle swapping journey direction
  const handleSwapDirection = () => {
    console.log(`Swapping direction: ${to} to ${from}`);
    setFrom(to);
    setTo(from);
    // The query will automatically refetch due to queryKey change
  };

  return (
    <div className="min-h-screen bg-background">
      <JourneyHeader
        from={from}
        to={to}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onSwap={handleSwapDirection}
        isRefreshing={isFetching}
        canRefresh={canRefresh}
      />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <div className="flex flex-col gap-3">
                <p>Failed to load journey data. Please check your connection and try again.</p>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline" 
                  size="sm"
                  className="w-fit"
                  data-testid="button-retry"
                >
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : routes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No journey options found for this route. Please try a different destination.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {routes.map((route, index) => (
              <RouteCard key={index} {...route} />
            ))}
          </div>
        )}
        
        <footer className="mt-8 text-center text-xs text-muted-foreground pb-6">
          Powered by TfL Open Data
        </footer>
      </main>
    </div>
  );
}
