/**
 * Shared Button Component
 * Wiederverwendbarer Button mit verschiedenen Varianten
 */

import React, { type CSSProperties, type ReactNode } from 'react';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, TRANSITIONS } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'tertiary';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: CSSProperties;
  className?: string;
}

const getVariantStyles = (variant: ButtonVariant, disabled: boolean): CSSProperties => {
  if (disabled) {
    return {
      background: 'linear-gradient(135deg, #475569, #334155)',
      color: '#94a3b8',
      cursor: 'not-allowed',
      opacity: 0.5,
    };
  }

  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg, ${COLORS.primary[400]}, ${COLORS.primary[600]})`,
      color: '#ffffff',
      boxShadow: SHADOWS.glow.primary,
    },
    secondary: {
      background: `linear-gradient(135deg, ${COLORS.secondary[500]}, ${COLORS.secondary[700]})`,
      color: '#ffffff',
      boxShadow: SHADOWS.glow.secondary,
    },
    tertiary: {
      background: `linear-gradient(135deg, ${COLORS.tertiary[400]}, ${COLORS.tertiary[600]})`,
      color: '#ffffff',
      boxShadow: SHADOWS.glow.tertiary,
    },
    success: {
      background: `linear-gradient(135deg, ${COLORS.success[500]}, ${COLORS.success[700]})`,
      color: '#ffffff',
      boxShadow: SHADOWS.glow.success,
    },
    danger: {
      background: `linear-gradient(135deg, ${COLORS.danger[500]}, ${COLORS.danger[700]})`,
      color: '#ffffff',
      boxShadow: SHADOWS.glow.danger,
    },
    ghost: {
      background: 'transparent',
      color: COLORS.neutral[300],
      border: `2px solid ${COLORS.neutral[600]}`,
    },
  };

  return variants[variant];
};

const getSizeStyles = (size: ButtonSize): CSSProperties => {
  const sizes: Record<ButtonSize, CSSProperties> = {
    sm: {
      padding: `${SPACING.sm} ${SPACING.md}`,
      fontSize: FONT_SIZES.sm,
    },
    md: {
      padding: `${SPACING.md} ${SPACING.lg}`,
      fontSize: FONT_SIZES.base,
    },
    lg: {
      padding: `${SPACING.lg} ${SPACING.xl}`,
      fontSize: FONT_SIZES.lg,
    },
    xl: {
      padding: `${SPACING.xl} ${SPACING['2xl']}`,
      fontSize: FONT_SIZES.xl,
    },
  };

  return sizes[size];
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  className,
}) => {
  const baseStyles: CSSProperties = {
    border: 'none',
    borderRadius: BORDER_RADIUS.lg,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: TRANSITIONS.base,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: fullWidth ? '100%' : 'auto',
    opacity: loading ? 0.7 : 1,
    ...getSizeStyles(size),
    ...getVariantStyles(variant, disabled || loading),
    ...style,
  };

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      style={baseStyles}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = SHADOWS.xl;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = getVariantStyles(variant, false).boxShadow as string;
        }
      }}
    >
      {loading && <span>⏳</span>}
      {!loading && icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
