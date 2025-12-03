import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JourneyHeader from '../../client/src/components/JourneyHeader';

describe('JourneyHeader Component', () => {
  const defaultProps = {
    from: 'High Barnet',
    to: 'Chancery Lane',
  };

  it('should render from and to stations', () => {
    render(<JourneyHeader {...defaultProps} />);
    expect(screen.getByText('High Barnet')).toBeInTheDocument();
    expect(screen.getByText('Chancery Lane')).toBeInTheDocument();
  });

  it('should render swap direction button', () => {
    render(<JourneyHeader {...defaultProps} />);
    const swapButton = screen.getByTestId('button-swap-direction');
    expect(swapButton).toBeInTheDocument();
  });

  it('should render refresh button', () => {
    render(<JourneyHeader {...defaultProps} />);
    const refreshButton = screen.getByTestId('button-refresh');
    expect(refreshButton).toBeInTheDocument();
  });

  it('should call onSwap when swap button is clicked', () => {
    const onSwap = vi.fn();
    render(<JourneyHeader {...defaultProps} onSwap={onSwap} />);
    
    const swapButton = screen.getByTestId('button-swap-direction');
    fireEvent.click(swapButton);
    
    expect(onSwap).toHaveBeenCalledTimes(1);
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(<JourneyHeader {...defaultProps} onRefresh={onRefresh} />);
    
    const refreshButton = screen.getByTestId('button-refresh');
    fireEvent.click(refreshButton);
    
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button when isRefreshing is true', () => {
    render(<JourneyHeader {...defaultProps} isRefreshing={true} />);
    const refreshButton = screen.getByTestId('button-refresh');
    expect(refreshButton).toBeDisabled();
  });

  it('should disable refresh button when canRefresh is false', () => {
    render(<JourneyHeader {...defaultProps} canRefresh={false} />);
    const refreshButton = screen.getByTestId('button-refresh');
    expect(refreshButton).toBeDisabled();
  });

  it('should show last updated time when provided', () => {
    const lastUpdated = new Date('2024-01-15T10:30:00');
    render(<JourneyHeader {...defaultProps} lastUpdated={lastUpdated} />);
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it('should not show last updated when not provided', () => {
    render(<JourneyHeader {...defaultProps} />);
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });

  it('should apply spinning animation when refreshing', () => {
    const { container } = render(<JourneyHeader {...defaultProps} isRefreshing={true} />);
    const refreshIcon = container.querySelector('.animate-spin');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('should not apply spinning animation when not refreshing', () => {
    const { container } = render(<JourneyHeader {...defaultProps} isRefreshing={false} />);
    const refreshIcon = container.querySelector('.animate-spin');
    expect(refreshIcon).not.toBeInTheDocument();
  });
});
