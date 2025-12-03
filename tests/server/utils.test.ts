import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mapTflMode,
  extractLineName,
  extractDirection,
  mapDisruptionSeverity,
  transformTflJourney,
  resolveStationToId,
  STATION_SEED_MAP,
  stationCache,
  clearStationCache,
} from '../../server/utils';

describe('Server Utils', () => {
  beforeEach(() => {
    clearStationCache();
    vi.clearAllMocks();
  });

  describe('mapTflMode', () => {
    it('should return "walking" for walking mode', () => {
      expect(mapTflMode('walking')).toBe('walking');
    });

    it('should return "tube" for tube mode', () => {
      expect(mapTflMode('tube')).toBe('tube');
    });

    it('should return "tube" for any non-walking mode', () => {
      expect(mapTflMode('bus')).toBe('tube');
      expect(mapTflMode('rail')).toBe('tube');
      expect(mapTflMode('')).toBe('tube');
    });
  });

  describe('extractLineName', () => {
    it('should extract line name from tube leg', () => {
      const leg = {
        mode: { id: 'tube' },
        routeOptions: [{ name: 'Northern' }],
      };
      expect(extractLineName(leg)).toBe('Northern');
    });

    it('should return undefined for walking leg', () => {
      const leg = {
        mode: { id: 'walking' },
        routeOptions: [{ name: 'Northern' }],
      };
      expect(extractLineName(leg)).toBeUndefined();
    });

    it('should fallback to mode name if routeOptions not available', () => {
      const leg = {
        mode: { id: 'tube', name: 'Central' },
      };
      expect(extractLineName(leg)).toBe('Central');
    });

    it('should return undefined if no line info available', () => {
      const leg = {
        mode: { id: 'tube' },
      };
      expect(extractLineName(leg)).toBeUndefined();
    });
  });

  describe('extractDirection', () => {
    it('should extract direction from tube leg', () => {
      const leg = {
        mode: { id: 'tube' },
        routeOptions: [{ directions: ['Morden via Bank'] }],
      };
      expect(extractDirection(leg)).toBe('Morden via Bank');
    });

    it('should return undefined for walking leg', () => {
      const leg = {
        mode: { id: 'walking' },
        routeOptions: [{ directions: ['Morden'] }],
      };
      expect(extractDirection(leg)).toBeUndefined();
    });

    it('should return undefined if no directions available', () => {
      const leg = {
        mode: { id: 'tube' },
        routeOptions: [{}],
      };
      expect(extractDirection(leg)).toBeUndefined();
    });
  });

  describe('mapDisruptionSeverity', () => {
    it('should return "info" for severity >= 10 (Good service)', () => {
      expect(mapDisruptionSeverity(10)).toBe('info');
      expect(mapDisruptionSeverity(15)).toBe('info');
    });

    it('should return "warning" for severity 6-9 (Minor delays)', () => {
      expect(mapDisruptionSeverity(6)).toBe('warning');
      expect(mapDisruptionSeverity(9)).toBe('warning');
    });

    it('should return "severe" for severity < 6 (Severe delays)', () => {
      expect(mapDisruptionSeverity(5)).toBe('severe');
      expect(mapDisruptionSeverity(0)).toBe('severe');
    });
  });

  describe('transformTflJourney', () => {
    const mockTflJourney = {
      duration: 45,
      startDateTime: '2024-01-15T10:00:00Z',
      arrivalDateTime: '2024-01-15T10:45:00Z',
      legs: [
        {
          mode: { id: 'tube' },
          routeOptions: [{ name: 'Northern', directions: ['Morden via Bank'] }],
          departurePoint: { commonName: 'High Barnet' },
          arrivalPoint: { commonName: 'Tottenham Court Road' },
          duration: 25,
          path: { stopPoints: Array(10).fill({}) },
        },
        {
          mode: { id: 'walking' },
          departurePoint: { commonName: 'Tottenham Court Road' },
          arrivalPoint: { commonName: 'Chancery Lane' },
          duration: 5,
          distance: 400,
        },
      ],
    };

    it('should transform TfL journey to our format', () => {
      const result = transformTflJourney(mockTflJourney, 0);

      expect(result.duration).toBe(45);
      expect(result.isFastest).toBe(true);
      expect(result.legs).toHaveLength(2);
    });

    it('should correctly transform tube leg', () => {
      const result = transformTflJourney(mockTflJourney, 0);
      const tubeLeg = result.legs[0];

      expect(tubeLeg.mode).toBe('tube');
      expect(tubeLeg.lineName).toBe('Northern');
      expect(tubeLeg.direction).toBe('Morden via Bank');
      expect(tubeLeg.from).toBe('High Barnet');
      expect(tubeLeg.to).toBe('Tottenham Court Road');
      expect(tubeLeg.duration).toBe(25);
      expect(tubeLeg.stops).toBe(10);
    });

    it('should correctly transform walking leg', () => {
      const result = transformTflJourney(mockTflJourney, 0);
      const walkingLeg = result.legs[1];

      expect(walkingLeg.mode).toBe('walking');
      expect(walkingLeg.lineName).toBeUndefined();
      expect(walkingLeg.distance).toBe(400);
    });

    it('should set isFastest to false for non-first journeys', () => {
      const result = transformTflJourney(mockTflJourney, 1);
      expect(result.isFastest).toBe(false);
    });

    it('should add good service disruption when none present', () => {
      const result = transformTflJourney(mockTflJourney, 0);

      expect(result.disruptions).toHaveLength(1);
      expect(result.disruptions[0].severity).toBe('info');
      expect(result.disruptions[0].message).toBe('Good service on all lines');
    });

    it('should include disruptions when present', () => {
      const journeyWithDisruption = {
        ...mockTflJourney,
        legs: [
          {
            ...mockTflJourney.legs[0],
            disruptions: [{ description: 'Minor delays on Northern line' }],
          },
        ],
      };

      const result = transformTflJourney(journeyWithDisruption, 0);

      expect(result.disruptions).toHaveLength(1);
      expect(result.disruptions[0].severity).toBe('warning');
      expect(result.disruptions[0].message).toBe('Minor delays on Northern line');
    });
  });

  describe('STATION_SEED_MAP', () => {
    it('should contain High Barnet station', () => {
      expect(STATION_SEED_MAP['high barnet']).toBe('940GZZLUHBT');
    });

    it('should contain Chancery Lane station', () => {
      expect(STATION_SEED_MAP['chancery lane']).toBe('940GZZLUCHL');
    });

    it('should contain Kings Cross station', () => {
      expect(STATION_SEED_MAP['kings cross']).toBe('940GZZLUKSX');
    });
  });

  describe('resolveStationToId', () => {
    beforeEach(() => {
      clearStationCache();
    });

    it('should resolve station from seed map', async () => {
      const result = await resolveStationToId('High Barnet');
      expect(result).toBe('940GZZLUHBT');
    });

    it('should be case insensitive', async () => {
      const result = await resolveStationToId('HIGH BARNET');
      expect(result).toBe('940GZZLUHBT');
    });

    it('should trim whitespace', async () => {
      const result = await resolveStationToId('  High Barnet  ');
      expect(result).toBe('940GZZLUHBT');
    });

    it('should use cache for repeated lookups', async () => {
      await resolveStationToId('High Barnet');
      expect(stationCache.has('high barnet')).toBe(true);

      const result = await resolveStationToId('High Barnet');
      expect(result).toBe('940GZZLUHBT');
    });

    it('should call TfL API for unknown stations', async () => {
      const mockResponse = {
        matches: [
          {
            name: 'Baker Street',
            icsCode: '940GZZLUBST',
            modes: ['tube'],
            stopType: 'NaptanMetroStation',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resolveStationToId('Baker Street');
      expect(result).toBe('940GZZLUBST');
      expect(fetch).toHaveBeenCalled();
    });

    it('should return null when API fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await resolveStationToId('Unknown Station');
      expect(result).toBeNull();
    });

    it('should return null when no tube stations found', async () => {
      const mockResponse = {
        matches: [
          {
            name: 'Some Bus Stop',
            modes: ['bus'],
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resolveStationToId('Some Bus Stop');
      expect(result).toBeNull();
    });

    it('should prefer NaptanMetroStation stop type', async () => {
      const mockResponse = {
        matches: [
          {
            name: 'Station Entrance',
            icsCode: '940ENTRANCE',
            modes: ['tube'],
            stopType: 'NaptanMetroEntrance',
          },
          {
            name: 'Station',
            icsCode: '940STATION',
            modes: ['tube'],
            stopType: 'NaptanMetroStation',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resolveStationToId('Test Station');
      expect(result).toBe('940STATION');
    });
  });
});
