import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DisruptionAlert from '../../client/src/components/DisruptionAlert';

describe('DisruptionAlert Component', () => {
  it('should render the message', () => {
    render(<DisruptionAlert severity="info" message="Good service on all lines" />);
    expect(screen.getByText('Good service on all lines')).toBeInTheDocument();
  });

  it('should render info severity with correct test id', () => {
    render(<DisruptionAlert severity="info" message="Good service" />);
    expect(screen.getByTestId('alert-info')).toBeInTheDocument();
  });

  it('should render warning severity with correct test id', () => {
    render(<DisruptionAlert severity="warning" message="Minor delays" />);
    expect(screen.getByTestId('alert-warning')).toBeInTheDocument();
  });

  it('should render severe severity with correct test id', () => {
    render(<DisruptionAlert severity="severe" message="Service suspended" />);
    expect(screen.getByTestId('alert-severe')).toBeInTheDocument();
  });

  it('should render warning severity', () => {
    render(<DisruptionAlert severity="warning" message="Minor delays" />);
    expect(screen.getByText('Minor delays')).toBeInTheDocument();
  });

  it('should render severe severity', () => {
    render(<DisruptionAlert severity="severe" message="Service suspended" />);
    expect(screen.getByText('Service suspended')).toBeInTheDocument();
  });

  it('should display long messages correctly', () => {
    const longMessage = 'There are severe delays on the Northern line due to a signal failure at Highgate. Trains are currently running at reduced frequency. Please allow extra time for your journey.';
    render(<DisruptionAlert severity="warning" message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});
