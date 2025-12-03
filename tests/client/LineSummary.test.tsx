import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LineSummary from '../../client/src/components/LineSummary';

describe('LineSummary Component', () => {
  it('should render single line', () => {
    render(<LineSummary lines={['Northern']} />);
    expect(screen.getByText('Northern')).toBeInTheDocument();
  });

  it('should render multiple lines', () => {
    render(<LineSummary lines={['Northern', 'Central', 'Victoria']} />);
    expect(screen.getByText('Northern')).toBeInTheDocument();
    expect(screen.getByText('Central')).toBeInTheDocument();
    expect(screen.getByText('Victoria')).toBeInTheDocument();
  });

  it('should render nothing for empty lines array', () => {
    const { container } = render(<LineSummary lines={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render line badges with correct test ids', () => {
    render(<LineSummary lines={['Northern', 'Central']} />);
    expect(screen.getByTestId('badge-line-northern')).toBeInTheDocument();
    expect(screen.getByTestId('badge-line-central')).toBeInTheDocument();
  });

  it('should show arrow between multiple lines', () => {
    const { container } = render(<LineSummary lines={['Northern', 'Central']} />);
    const arrowIcons = container.querySelectorAll('.lucide-arrow-right');
    expect(arrowIcons.length).toBe(1);
  });

  it('should not show arrow for single line', () => {
    const { container } = render(<LineSummary lines={['Northern']} />);
    const arrowIcons = container.querySelectorAll('.lucide-arrow-right');
    expect(arrowIcons.length).toBe(0);
  });

  it('should render lines in order', () => {
    render(<LineSummary lines={['Victoria', 'Central', 'Northern']} />);
    expect(screen.getByTestId('badge-line-victoria')).toBeInTheDocument();
    expect(screen.getByTestId('badge-line-central')).toBeInTheDocument();
    expect(screen.getByTestId('badge-line-northern')).toBeInTheDocument();
  });
});
