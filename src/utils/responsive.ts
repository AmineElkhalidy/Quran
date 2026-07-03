import { useWindowDimensions } from 'react-native';

// Standard tablet breakpoint
const TABLET_BREAKPOINT = 768;
// Large tablet/desktop breakpoint
const DESKTOP_BREAKPOINT = 1024;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= TABLET_BREAKPOINT;
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const isLandscape = width > height;

  // Calculate a responsive scaling factor based on a standard phone width (e.g. 375px)
  // Max scale to prevent things getting ridiculously huge on very large screens
  const scale = Math.min(width / 375, 1.5);
  
  // Helper to scale sizes slightly on tablets, but not linearly
  const moderateScale = (size: number, factor: number = 0.5) => size + (scale - 1) * size * factor;

  // Maximum width for reading/centered content views
  const maxWidth = isDesktop ? 800 : isTablet ? 700 : '100%';

  return {
    width,
    height,
    isTablet,
    isDesktop,
    isLandscape,
    scale,
    moderateScale,
    maxWidth,
  };
}
