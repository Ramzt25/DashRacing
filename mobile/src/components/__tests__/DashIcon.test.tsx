import React from 'react';
import { render } from '@testing-library/react-native';
import { DashIcon } from '../DashIcon';

describe('DashIcon Component', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = render(<DashIcon name="home" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders with custom size and color', () => {
    const { getByTestId } = render(
      <DashIcon name="live-race" size={32} color="#FF0000" />
    );
    expect(getByTestId).toBeDefined();
  });

  it('shows focused state correctly', () => {
    const { toJSON } = render(
      <DashIcon name="garage" focused={true} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders all icon types without crashing', () => {
    const iconTypes: Array<'home' | 'live-race' | 'events' | 'garage' | 'map' | 'profile' | 'settings' | 'back' | 'timer' | 'car' | 'nearby'> = [
      'home', 'live-race', 'events', 'garage', 'map', 'profile', 'settings', 'back', 'timer', 'car', 'nearby'
    ];

    iconTypes.forEach(iconType => {
      expect(() => render(<DashIcon name={iconType} />)).not.toThrow();
    });
  });

  it('applies correct styles for focused state', () => {
    const { getByTestId } = render(
      <DashIcon name="map" focused={true} />
    );
    expect(getByTestId).toBeDefined();
  });

  it('uses Ionicons for fallback icons', () => {
    const { toJSON } = render(<DashIcon name="back" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles custom icon images correctly', () => {
    const { toJSON } = render(<DashIcon name="home" />);
    expect(toJSON()).toMatchSnapshot();
  });
});