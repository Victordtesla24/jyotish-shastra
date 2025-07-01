import React from 'react';

// A set of props used by framer-motion that are not valid on standard DOM elements.
const motionProps = new Set([
  'initial',
  'animate',
  'exit',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileInView',
  'transition',
  'variants',
  'onAnimationStart',
  'onAnimationComplete',
  'onUpdate',
  'layout',
  'layoutId'
]);

// A factory function to create mocked motion components.
const createMockMotionComponent = (Component) => {
  return React.forwardRef(({ children, ...props }, ref) => {
    const filteredProps = {};
    for (const key in props) {
      if (!motionProps.has(key)) {
        filteredProps[key] = props[key];
      }
    }
    return (
      <Component {...filteredProps} ref={ref}>
        {children}
      </Component>
    );
  });
};

// Mock the 'motion' object from framer-motion
export const motion = {
  div: createMockMotionComponent('div'),
  h1: createMockMotionComponent('h1'),
  h2: createMockMotionComponent('h2'),
  h3: createMockMotionComponent('h3'),
  p: createMockMotionComponent('p'),
  button: createMockMotionComponent('button'),
  // Add any other motion components you use here as needed.
};

// Mock other exports if your component uses them
export const AnimatePresence = ({ children }) => <>{children}</>;
export const useAnimation = () => [() => {}, {}];
export const useInView = () => [() => {}, true];
export const useIsPresent = () => true;
