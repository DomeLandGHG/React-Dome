/**
 * Shared Card Component
 * Wiederverwendbare Card für Panels, Modals, etc.
 */

import React, { type CSSProperties, type ReactNode } from 'react';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  title?: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary';
  padding?: keyof typeof SPACING;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const getVariantStyles = (variant: CardProps['variant']): CSSProperties => {
  const variants = {
    default: {
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
      border: `2px solid ${COLORS.neutral[700]}`,
    },
    primary: {
      background: `linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(15, 23, 42, 0.9))`,
      border: `2px solid ${COLORS.primary[600]}`,
    },
    secondary: {
      background: `linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(15, 23, 42, 0.9))`,
      border: `2px solid ${COLORS.secondary[600]}`,
    },
    tertiary: {
      background: `linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(15, 23, 42, 0.9))`,
      border: `2px solid ${COLORS.tertiary[600]}`,
    },
  };

  return variants[variant || 'default'];
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  variant = 'default',
  padding = 'lg',
  style,
  className,
  onClick,
  hoverable = false,
}) => {
  const baseStyles: CSSProperties = {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[padding],
    backdropFilter: 'blur(10px)',
    boxShadow: SHADOWS.lg,
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...getVariantStyles(variant),
    ...style,
  };

  return (
    <div
      style={baseStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = SHADOWS.xl;
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = SHADOWS.lg;
        }
      }}
    >
      {(title || icon) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.md,
          marginBottom: SPACING.lg,
          paddingBottom: SPACING.md,
          borderBottom: `1px solid ${COLORS.neutral[700]}`,
        }}>
          {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
          {title && (
            <h3 style={{
              margin: 0,
              color: COLORS.neutral[100],
              fontSize: '1.25rem',
              fontWeight: 700,
            }}>
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
