import React from 'react';

const motionProps = new Set([
  'animate',
  'exit',
  'initial',
  'layout',
  'layoutId',
  'transition',
  'variants',
  'whileHover',
  'whileInView',
  'whileTap',
  'viewport',
]);

const componentCache = new Map();

const getOrCreateMotionComponent = (defaultTag = 'div') => {
  if (componentCache.has(defaultTag)) {
    return componentCache.get(defaultTag);
  }

  const MotionComponent = React.forwardRef(({ as: Component = defaultTag, children, ...props }, ref) => {
    const domProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !motionProps.has(key))
    );
    return React.createElement(Component, { ...domProps, ref }, children);
  });

  MotionComponent.displayName = `Motion${typeof defaultTag === 'string' ? defaultTag : 'Component'}`;
  componentCache.set(defaultTag, MotionComponent);
  return MotionComponent;
};

const defaultComponent = getOrCreateMotionComponent('div');

const motion = new Proxy(defaultComponent, {
  get: (target, prop) => {
    if (typeof prop === 'string') {
      return getOrCreateMotionComponent(prop);
    }
    return Reflect.get(target, prop);
  },
});

export const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);
export { motion };
export default motion;
