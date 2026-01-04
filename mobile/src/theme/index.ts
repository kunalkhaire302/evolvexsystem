// Theme configuration matching the web design
export const theme = {
  colors: {
    primary: '#00d9ff',
    secondary: '#7000ff',
    background: '#0a0a0f',
    backgroundSecondary: '#121218',
    card: 'rgba(0,217,255,0.05)',
    cardBorder: 'rgba(0,217,255,0.2)',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    textMuted: '#666666',
    success: '#00ff00',
    warning: '#ffaa00',
    danger: '#ff4444',
    expBar: '#00d9ff',
    healthBar: '#ff4444',
    easy: '#00ff00',
    medium: '#ffaa00',
    hard: '#ff4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 36,
  },
};

export type Theme = typeof theme;
