import { describe, it, expect } from 'vitest';
import {
  insertJourneySchema,
  insertDisruptionSchema,
  insertJourneyLegSchema,
} from '../../shared/schema';

describe('Schema Validation', () => {
  describe('insertJourneyLegSchema', () => {
    it('should validate a valid tube leg', () => {
      const validLeg = {
        mode: 'tube',
        lineName: 'Northern',
        direction: 'Morden via Bank',
        from: 'High Barnet',
        to: 'Tottenham Court Road',
        duration: 25,
        stops: 10,
      };

      const result = insertJourneyLegSchema.safeParse(validLeg);
      expect(result.success).toBe(true);
    });

    it('should validate a valid walking leg', () => {
      const validLeg = {
        mode: 'walking',
        from: 'Station A',
        to: 'Station B',
        duration: 5,
        distance: 400,
      };

      const result = insertJourneyLegSchema.safeParse(validLeg);
      expect(result.success).toBe(true);
    });

    it('should reject invalid mode', () => {
      const invalidLeg = {
        mode: 'bus',
        from: 'A',
        to: 'B',
        duration: 10,
      };

      const result = insertJourneyLegSchema.safeParse(invalidLeg);
      expect(result.success).toBe(false);
    });

    it('should require from and to fields', () => {
      const invalidLeg = {
        mode: 'tube',
        duration: 10,
      };

      const result = insertJourneyLegSchema.safeParse(invalidLeg);
      expect(result.success).toBe(false);
    });
  });

  describe('insertDisruptionSchema', () => {
    it('should validate info severity', () => {
      const valid = {
        severity: 'info',
        message: 'Good service',
      };

      const result = insertDisruptionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate warning severity', () => {
      const valid = {
        severity: 'warning',
        message: 'Minor delays',
      };

      const result = insertDisruptionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate severe severity', () => {
      const valid = {
        severity: 'severe',
        message: 'Service suspended',
      };

      const result = insertDisruptionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid severity', () => {
      const invalid = {
        severity: 'critical',
        message: 'Some message',
      };

      const result = insertDisruptionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should require message field', () => {
      const invalid = {
        severity: 'info',
      };

      const result = insertDisruptionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('insertJourneySchema', () => {
    it('should validate a complete journey', () => {
      const validJourney = {
        duration: 45,
        departureTime: '10:00',
        arrivalTime: '10:45',
        legs: [
          {
            mode: 'tube',
            from: 'High Barnet',
            to: 'Chancery Lane',
            duration: 45,
          },
        ],
        disruptions: [
          {
            severity: 'info',
            message: 'Good service',
          },
        ],
        isFastest: true,
      };

      const result = insertJourneySchema.safeParse(validJourney);
      expect(result.success).toBe(true);
    });

    it('should require legs array', () => {
      const invalidJourney = {
        duration: 45,
        departureTime: '10:00',
        arrivalTime: '10:45',
        disruptions: [],
        isFastest: true,
      };

      const result = insertJourneySchema.safeParse(invalidJourney);
      expect(result.success).toBe(false);
    });

    it('should require disruptions array', () => {
      const invalidJourney = {
        duration: 45,
        departureTime: '10:00',
        arrivalTime: '10:45',
        legs: [],
        isFastest: true,
      };

      const result = insertJourneySchema.safeParse(invalidJourney);
      expect(result.success).toBe(false);
    });

    it('should require isFastest boolean', () => {
      const invalidJourney = {
        duration: 45,
        departureTime: '10:00',
        arrivalTime: '10:45',
        legs: [],
        disruptions: [],
      };

      const result = insertJourneySchema.safeParse(invalidJourney);
      expect(result.success).toBe(false);
    });
  });
});
