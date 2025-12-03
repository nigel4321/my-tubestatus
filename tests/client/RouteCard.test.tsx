import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RouteCard from '../../client/src/components/RouteCard';

describe('RouteCard Component', () => {
  const defaultProps = {
    duration: 45,
    departureTime: '10:00',
    arrivalTime: '10:45',
    legs: [
      {
        mode: 'tube' as const,
        lineName: 'Northern',
        direction: 'Morden via Bank',
        from: 'High Barnet',
        to: 'Tottenham Court Road',
        duration: 25,
        stops: 10,
      },
      {
        mode: 'tube' as const,
        lineName: 'Central',
        direction: 'Epping',
        from: 'Tottenham Court Road',
        to: 'Chancery Lane',
        duration: 3,
        stops: 1,
      },
    ],
    disruptions: [
      { severity: 'info' as const, message: 'Good service' },
    ],
    isFastest: false,
  };

  it('should render duration', () => {
    render(<RouteCard {...defaultProps} />);
    expect(screen.getByTestId('text-duration')).toHaveTextContent('45 min');
  });

  it('should render departure time', () => {
    render(<RouteCard {...defaultProps} />);
    expect(screen.getByTestId('text-departure')).toHaveTextContent('10:00');
  });

  it('should render arrival time', () => {
    render(<RouteCard {...defaultProps} />);
    expect(screen.getByTestId('text-arrival')).toHaveTextContent('10:45');
  });

  it('should show "Fastest" badge when isFastest is true', () => {
    render(<RouteCard {...defaultProps} isFastest={true} />);
    expect(screen.getByText('Fastest')).toBeInTheDocument();
  });

  it('should not show "Fastest" badge when isFastest is false', () => {
    render(<RouteCard {...defaultProps} isFastest={false} />);
    expect(screen.queryByText('Fastest')).not.toBeInTheDocument();
  });

  it('should show expand button with step count', () => {
    render(<RouteCard {...defaultProps} />);
    expect(screen.getByTestId('button-expand-route')).toHaveTextContent('Show 2 steps');
  });

  it('should toggle expansion when button is clicked', () => {
    render(<RouteCard {...defaultProps} />);
    const expandButton = screen.getByTestId('button-expand-route');
    
    expect(screen.queryByText(/towards Morden via Bank/)).not.toBeInTheDocument();
    
    fireEvent.click(expandButton);
    expect(screen.getByTestId('button-expand-route')).toHaveTextContent('Hide details');
    expect(screen.getByText(/towards Morden via Bank/)).toBeInTheDocument();
    
    fireEvent.click(expandButton);
    expect(screen.getByTestId('button-expand-route')).toHaveTextContent('Show 2 steps');
  });

  it('should render line summary badges', () => {
    render(<RouteCard {...defaultProps} />);
    expect(screen.getByTestId('badge-line-northern')).toBeInTheDocument();
    expect(screen.getByTestId('badge-line-central')).toBeInTheDocument();
  });

  it('should render disruption alerts', () => {
    render(<RouteCard {...defaultProps} />);
    expect(screen.getByText('Good service')).toBeInTheDocument();
  });

  it('should render warning disruption', () => {
    const propsWithWarning = {
      ...defaultProps,
      disruptions: [
        { severity: 'warning' as const, message: 'Minor delays on Northern line' },
      ],
    };
    render(<RouteCard {...propsWithWarning} />);
    expect(screen.getByText('Minor delays on Northern line')).toBeInTheDocument();
  });

  it('should render severe disruption', () => {
    const propsWithSevere = {
      ...defaultProps,
      disruptions: [
        { severity: 'severe' as const, message: 'Service suspended' },
      ],
    };
    render(<RouteCard {...propsWithSevere} />);
    expect(screen.getByText('Service suspended')).toBeInTheDocument();
  });

  it('should render multiple disruptions', () => {
    const propsWithMultipleDisruptions = {
      ...defaultProps,
      disruptions: [
        { severity: 'warning' as const, message: 'Delay 1' },
        { severity: 'severe' as const, message: 'Delay 2' },
      ],
    };
    render(<RouteCard {...propsWithMultipleDisruptions} />);
    expect(screen.getByText('Delay 1')).toBeInTheDocument();
    expect(screen.getByText('Delay 2')).toBeInTheDocument();
  });

  it('should deduplicate tube lines in summary', () => {
    const propsWithDuplicateLines = {
      ...defaultProps,
      legs: [
        { mode: 'tube' as const, lineName: 'Northern', from: 'A', to: 'B', duration: 10 },
        { mode: 'tube' as const, lineName: 'Northern', from: 'B', to: 'C', duration: 10 },
      ],
    };
    render(<RouteCard {...propsWithDuplicateLines} />);
    const northernBadges = screen.getAllByTestId('badge-line-northern');
    expect(northernBadges).toHaveLength(1);
  });

  it('should not include walking legs in line summary', () => {
    const propsWithWalking = {
      ...defaultProps,
      legs: [
        { mode: 'tube' as const, lineName: 'Northern', from: 'A', to: 'B', duration: 10 },
        { mode: 'walking' as const, from: 'B', to: 'C', duration: 5, distance: 200 },
      ],
    };
    render(<RouteCard {...propsWithWalking} />);
    expect(screen.getByTestId('badge-line-northern')).toBeInTheDocument();
    expect(screen.queryByText('walking')).not.toBeInTheDocument();
  });
});
