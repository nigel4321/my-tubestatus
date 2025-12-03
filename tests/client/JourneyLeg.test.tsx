import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import JourneyLeg from '../../client/src/components/JourneyLeg';

describe('JourneyLeg Component', () => {
  describe('Tube Leg', () => {
    const tubeLegProps = {
      mode: 'tube' as const,
      lineName: 'Northern',
      direction: 'Morden via Bank',
      from: 'High Barnet',
      to: 'Tottenham Court Road',
      duration: 25,
      stops: 10,
    };

    it('should render tube leg with line name', () => {
      render(<JourneyLeg {...tubeLegProps} />);
      expect(screen.getByText('Northern')).toBeInTheDocument();
    });

    it('should render from station', () => {
      render(<JourneyLeg {...tubeLegProps} />);
      expect(screen.getByText('High Barnet')).toBeInTheDocument();
    });

    it('should render to station', () => {
      render(<JourneyLeg {...tubeLegProps} />);
      expect(screen.getByText('Tottenham Court Road')).toBeInTheDocument();
    });

    it('should render direction', () => {
      render(<JourneyLeg {...tubeLegProps} />);
      expect(screen.getByText(/towards Morden via Bank/)).toBeInTheDocument();
    });

    it('should render stops count', () => {
      render(<JourneyLeg {...tubeLegProps} />);
      expect(screen.getByText(/10 stops/)).toBeInTheDocument();
    });

    it('should render duration', () => {
      render(<JourneyLeg {...tubeLegProps} />);
      expect(screen.getByText(/25/)).toBeInTheDocument();
    });
  });

  describe('Walking Leg', () => {
    const walkingLegProps = {
      mode: 'walking' as const,
      from: 'Tottenham Court Road',
      to: 'Chancery Lane',
      duration: 5,
      distance: 400,
    };

    it('should render walking leg with correct test id', () => {
      render(<JourneyLeg {...walkingLegProps} />);
      expect(screen.getByTestId('leg-walking')).toBeInTheDocument();
    });

    it('should render from location', () => {
      render(<JourneyLeg {...walkingLegProps} />);
      expect(screen.getByText('Tottenham Court Road')).toBeInTheDocument();
    });

    it('should render to location', () => {
      render(<JourneyLeg {...walkingLegProps} />);
      expect(screen.getByText('Chancery Lane')).toBeInTheDocument();
    });

    it('should render distance', () => {
      render(<JourneyLeg {...walkingLegProps} />);
      expect(screen.getByText(/400/)).toBeInTheDocument();
    });

    it('should render walking duration', () => {
      render(<JourneyLeg {...walkingLegProps} />);
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing line name gracefully', () => {
      const props = {
        mode: 'tube' as const,
        from: 'A',
        to: 'B',
        duration: 10,
      };
      render(<JourneyLeg {...props} />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle missing direction gracefully', () => {
      const props = {
        mode: 'tube' as const,
        lineName: 'Northern',
        from: 'A',
        to: 'B',
        duration: 10,
      };
      render(<JourneyLeg {...props} />);
      expect(screen.getByText('Northern')).toBeInTheDocument();
    });

    it('should handle zero stops', () => {
      const props = {
        mode: 'tube' as const,
        lineName: 'Northern',
        from: 'A',
        to: 'B',
        duration: 1,
        stops: 0,
      };
      render(<JourneyLeg {...props} />);
      expect(screen.getByText('Northern')).toBeInTheDocument();
    });
  });
});
