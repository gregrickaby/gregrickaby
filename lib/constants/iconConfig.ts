export const DEFAULT_ICON_SIZE = 24;

export const ICON_SIZES = {
  xsmall: 12,
  small: 16,
  default: 24,
  large: 32,
  xlarge: 48,
} as const;

export type IconSize = (typeof ICON_SIZES)[keyof typeof ICON_SIZES];
