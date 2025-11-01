"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils.js';

const Skeleton = ({
  className,
  variant = 'text',
  width,
  height,
  rounded = true,
  animate = true
}) => {
  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-40 w-full',
    card: 'h-64 w-full',
    button: 'h-11 w-32',
    input: 'h-11 w-full',
  };

  const baseClasses = cn(
    'bg-gradient-to-r from-vedic-border/50 via-vedic-border/30 to-vedic-border/50',
    rounded && variant !== 'avatar' && 'rounded-lg',
    variantClasses[variant],
    className
  );

  const shimmerAnimation = {
    x: ['-100%', '100%'],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  };

  return (
    <div
      className={cn(baseClasses, 'relative overflow-hidden')}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          animate={shimmerAnimation}
        />
      )}
    </div>
  );
};

// Skeleton Container for multiple skeleton items
export const SkeletonContainer = ({ children, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  );
};

// Preset Skeleton Components
export const SkeletonCard = ({ className }) => (
  <div className={cn('p-6 rounded-2xl bg-vedic-surface border border-vedic-border', className)}>
    <SkeletonContainer>
      <Skeleton variant="avatar" />
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </SkeletonContainer>
  </div>
);

export const SkeletonForm = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <SkeletonContainer>
      <div>
        <Skeleton variant="text" width="100px" className="mb-2" />
        <Skeleton variant="input" />
      </div>
      <div>
        <Skeleton variant="text" width="100px" className="mb-2" />
        <Skeleton variant="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton variant="text" width="80px" className="mb-2" />
          <Skeleton variant="input" />
        </div>
        <div>
          <Skeleton variant="text" width="80px" className="mb-2" />
          <Skeleton variant="input" />
        </div>
      </div>
      <Skeleton variant="button" className="ml-auto" />
    </SkeletonContainer>
  </div>
);

export const SkeletonTable = ({ rows = 5, className }) => (
  <div className={cn('overflow-hidden rounded-xl border border-vedic-border', className)}>
    <div className="bg-vedic-surface p-4 border-b border-vedic-border">
      <div className="flex gap-4">
        <Skeleton variant="text" width="25%" />
        <Skeleton variant="text" width="25%" />
        <Skeleton variant="text" width="25%" />
        <Skeleton variant="text" width="25%" />
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-vedic-surface p-4 border-b border-vedic-border">
        <div className="flex gap-4">
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="25%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ className }) => (
  <div className={cn('p-6 rounded-2xl bg-vedic-surface border border-vedic-border', className)}>
    <Skeleton variant="title" className="mb-4" />
    <Skeleton variant="card" height="300px" />
    <div className="flex justify-center gap-4 mt-4">
      <Skeleton variant="text" width="60px" />
      <Skeleton variant="text" width="60px" />
      <Skeleton variant="text" width="60px" />
    </div>
  </div>
);

export default Skeleton;
