import { useState, useEffect } from 'react';

// Breakpoints padrão do Tailwind CSS
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  currentBreakpoint: Breakpoint | 'xs';
}

export function useResponsive(): ResponsiveState {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentBreakpoint = (width: number): Breakpoint | 'xs' => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const isMobile = dimensions.width < breakpoints.md;
  const isTablet = dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg;
  const isDesktop = dimensions.width >= breakpoints.lg && dimensions.width < breakpoints.xl;
  const isLargeDesktop = dimensions.width >= breakpoints.xl;

  return {
    width: dimensions.width,
    height: dimensions.height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint: getCurrentBreakpoint(dimensions.width),
  };
}

// Hook para classes CSS responsivas condicionais
export function useResponsiveClasses() {
  const { isMobile, isTablet, isDesktop, isLargeDesktop, currentBreakpoint } = useResponsive();

  const getResponsiveClasses = (config: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    largeDesktop?: string;
    base?: string;
  }) => {
    const { mobile = '', tablet = '', desktop = '', largeDesktop = '', base = '' } = config;
    
    let classes = base;
    
    if (isMobile && mobile) classes += ` ${mobile}`;
    else if (isTablet && tablet) classes += ` ${tablet}`;
    else if (isDesktop && desktop) classes += ` ${desktop}`;
    else if (isLargeDesktop && largeDesktop) classes += ` ${largeDesktop}`;
    
    return classes.trim();
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint,
    getResponsiveClasses,
  };
}