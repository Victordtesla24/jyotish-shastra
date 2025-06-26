import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook to animate a number counting up when it becomes visible in the viewport.
 * @param {number} end - The final number to count up to.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @returns {[React.RefObject, number]} - A ref to attach to the element and the current animated number.
 */
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const observer = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Trigger when 50% of the element is visible
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();

          const animate = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentNum = Math.floor(progress * end);

            setCount(currentNum);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end); // Ensure it ends on the exact number
            }
          };

          requestAnimationFrame(animate);
          observer.current.disconnect(); // Disconnect after animation starts
        }
      });
    };

    observer.current = new IntersectionObserver(callback, options);
    observer.current.observe(node);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [end, duration]);

  return [ref, count];
};

export default useCountUp;
