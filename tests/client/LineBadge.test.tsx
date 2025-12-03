import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LineBadge from '../../client/src/components/LineBadge';

describe('LineBadge Component', () => {
  it('should render the line name', () => {
    render(<LineBadge lineName="Northern" />);
    expect(screen.getByText('Northern')).toBeInTheDocument();
  });

  it('should apply correct color for Northern line', () => {
    render(<LineBadge lineName="Northern" />);
    const badge = screen.getByTestId('badge-line-northern');
    expect(badge).toHaveStyle({ backgroundColor: '#000000', color: '#FFFFFF' });
  });

  it('should apply correct color for Central line', () => {
    render(<LineBadge lineName="Central" />);
    const badge = screen.getByTestId('badge-line-central');
    expect(badge).toHaveStyle({ backgroundColor: '#DC241F', color: '#FFFFFF' });
  });

  it('should apply correct color for Victoria line', () => {
    render(<LineBadge lineName="Victoria" />);
    const badge = screen.getByTestId('badge-line-victoria');
    expect(badge).toHaveStyle({ backgroundColor: '#00A0E2', color: '#FFFFFF' });
  });

  it('should apply correct color for Circle line (dark text)', () => {
    render(<LineBadge lineName="Circle" />);
    const badge = screen.getByTestId('badge-line-circle');
    expect(badge).toHaveStyle({ backgroundColor: '#FFD300', color: '#000000' });
  });

  it('should use fallback color for unknown lines', () => {
    render(<LineBadge lineName="Unknown Line" />);
    const badge = screen.getByTestId('badge-line-unknown-line');
    expect(badge).toHaveStyle({ backgroundColor: '#666666', color: '#FFFFFF' });
  });

  it('should use custom lineColor when provided', () => {
    render(<LineBadge lineName="Northern" lineColor="#FF0000" />);
    const badge = screen.getByTestId('badge-line-northern');
    expect(badge).toHaveStyle({ backgroundColor: '#FF0000' });
  });

  it('should generate correct test id with spaces', () => {
    render(<LineBadge lineName="Hammersmith & City" />);
    const badge = screen.getByTestId('badge-line-hammersmith-&-city');
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct color for all tube lines', () => {
    const lines = [
      { name: 'Bakerloo', bg: '#894E24' },
      { name: 'District', bg: '#007229' },
      { name: 'Jubilee', bg: '#6A7278' },
      { name: 'Metropolitan', bg: '#751056' },
      { name: 'Piccadilly', bg: '#0019A8' },
      { name: 'Elizabeth', bg: '#6950a1' },
    ];

    lines.forEach(({ name, bg }) => {
      const { unmount } = render(<LineBadge lineName={name} />);
      const badge = screen.getByText(name);
      expect(badge).toHaveStyle({ backgroundColor: bg });
      unmount();
    });
  });
});
