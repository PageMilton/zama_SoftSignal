/**
 * Design Tokens for SoftSignal
 * Generated deterministically from seed: SHA256("SoftSignal" + "Sepolia" + "202511" + "SoftSignal.sol")
 * 
 * Design System: Modern Minimalist
 * Primary Color: Indigo-600 (#4F46E5) - Trust & Security
 * Secondary Color: Emerald-500 (#10B981) - Health & Growth
 */

export const designTokens = {
  // Color Palette
  colors: {
    // Primary (Brand - Indigo)
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
      950: '#1E1B4B',
    },
    // Secondary (Accent - Emerald)
    secondary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
      950: '#022C22',
    },
    // Success (Emerald)
    success: {
      light: '#10B981',
      DEFAULT: '#059669',
      dark: '#047857',
    },
    // Warning (Amber)
    warning: {
      light: '#FCD34D',
      DEFAULT: '#F59E0B',
      dark: '#D97706',
    },
    // Danger (Rose)
    danger: {
      light: '#FB7185',
      DEFAULT: '#F43F5E',
      dark: '#E11D48',
    },
    // Neutrals (Slate)
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
    // Semantic Colors for Metrics
    mood: {
      low: '#EF4444', // Red
      medium: '#F59E0B', // Amber
      high: '#10B981', // Emerald
    },
    stress: {
      low: '#10B981', // Emerald (low stress is good)
      medium: '#F59E0B', // Amber
      high: '#EF4444', // Red
    },
    sleep: {
      low: '#EF4444', // Red (poor sleep)
      medium: '#F59E0B', // Amber
      high: '#06B6D4', // Cyan (good sleep)
    },
    // Risk Levels
    risk: {
      low: '#10B981', // Green
      moderate: '#F59E0B', // Amber
      elevated: '#F97316', // Orange
      high: '#EF4444', // Red
    },
  },

  // Typography
  typography: {
    fontFamily: {
      heading: 'var(--font-inter), system-ui, -apple-system, sans-serif',
      body: 'var(--font-inter), system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, Menlo, Monaco, "Cascadia Code", monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (0.25rem increments)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    48: '12rem',    // 192px
    64: '16rem',    // 256px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows (elevation levels)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },

  // Breakpoints
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
  },

  // Density Modes
  density: {
    compact: {
      padding: '0.5rem',
      gap: '0.5rem',
      fontSize: '0.875rem',
    },
    comfortable: {
      padding: '1rem',
      gap: '1rem',
      fontSize: '1rem',
    },
  },

  // Dark Mode Colors
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',
    border: '#334155',
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
    },
  },
} as const;

// CSS Variables for easy usage
export const cssVariables = `
  :root {
    /* Colors */
    --color-primary: ${designTokens.colors.primary[600]};
    --color-secondary: ${designTokens.colors.secondary[500]};
    --color-success: ${designTokens.colors.success.DEFAULT};
    --color-warning: ${designTokens.colors.warning.DEFAULT};
    --color-danger: ${designTokens.colors.danger.DEFAULT};
    
    /* Backgrounds */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    /* Primary */
    --primary: 239 84% 58%;
    --primary-foreground: 210 40% 98%;
    
    /* Secondary */
    --secondary: 160 84% 39%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    /* Muted */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    /* Accent */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    /* Destructive */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    /* Border */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 239 84% 58%;
    
    /* Radius */
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 239 84% 67%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 160 84% 45%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 239 84% 67%;
  }
`;

// Export utility functions
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = designTokens.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (key: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[key];
};

export const getShadow = (key: keyof typeof designTokens.shadows) => {
  return designTokens.shadows[key];
};


