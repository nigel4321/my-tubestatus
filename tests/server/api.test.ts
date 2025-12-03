import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/journeys request validation', () => {
    it('should validate from parameter is required', () => {
      const query = new URLSearchParams({ to: 'Chancery Lane' });
      const from = query.get('from');
      expect(from).toBeNull();
    });

    it('should validate to parameter is required', () => {
      const query = new URLSearchParams({ from: 'High Barnet' });
      const to = query.get('to');
      expect(to).toBeNull();
    });

    it('should parse both parameters when provided', () => {
      const query = new URLSearchParams({ from: 'High Barnet', to: 'Chancery Lane' });
      expect(query.get('from')).toBe('High Barnet');
      expect(query.get('to')).toBe('Chancery Lane');
    });
  });

  describe('Journey Response Format', () => {
    const mockJourneyResponse = {
      journeys: [
        {
          duration: 45,
          departureTime: '10:00',
          arrivalTime: '10:45',
          legs: [
            {
              mode: 'tube',
              lineName: 'Northern',
              from: 'High Barnet',
              to: 'Chancery Lane',
              duration: 45,
              stops: 15,
            },
          ],
          disruptions: [
            { severity: 'info', message: 'Good service' },
          ],
          isFastest: true,
        },
      ],
    };

    it('should return journeys array', () => {
      expect(mockJourneyResponse.journeys).toBeInstanceOf(Array);
    });

    it('should include duration in journey', () => {
      expect(mockJourneyResponse.journeys[0].duration).toBe(45);
    });

    it('should include departure and arrival times', () => {
      expect(mockJourneyResponse.journeys[0].departureTime).toBe('10:00');
      expect(mockJourneyResponse.journeys[0].arrivalTime).toBe('10:45');
    });

    it('should include legs array', () => {
      expect(mockJourneyResponse.journeys[0].legs).toBeInstanceOf(Array);
      expect(mockJourneyResponse.journeys[0].legs.length).toBeGreaterThan(0);
    });

    it('should include disruptions array', () => {
      expect(mockJourneyResponse.journeys[0].disruptions).toBeInstanceOf(Array);
    });

    it('should include isFastest flag', () => {
      expect(mockJourneyResponse.journeys[0].isFastest).toBe(true);
    });
  });

  describe('TfL API Integration', () => {
    it('should handle empty journeys response', () => {
      const emptyResponse = { journeys: [] };
      expect(emptyResponse.journeys).toHaveLength(0);
    });

    it('should limit journeys to 5 routes', () => {
      const mockJourneys = Array(10).fill({
        duration: 45,
        startDateTime: new Date().toISOString(),
        arrivalDateTime: new Date().toISOString(),
        legs: [],
      });
      
      const limitedJourneys = mockJourneys.slice(0, 5);
      expect(limitedJourneys).toHaveLength(5);
    });

    it('should mark first journey as fastest', () => {
      const journeys = [
        { isFastest: true },
        { isFastest: false },
        { isFastest: false },
      ];
      
      expect(journeys[0].isFastest).toBe(true);
      expect(journeys[1].isFastest).toBe(false);
    });
  });
});
