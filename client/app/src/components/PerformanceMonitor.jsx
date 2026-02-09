import React, { useEffect } from "react";

const PerformanceMonitor = ({ children }) => {
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      // Monitor for large re-renders
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "measure" && entry.duration > 16) {
            console.warn(
              `Slow render detected: ${entry.name} took ${entry.duration}ms`
            );
          }
        });
      });

      observer.observe({ entryTypes: ["measure", "navigation", "paint"] });

      // Monitor memory usage
      const checkMemory = () => {
        if (performance.memory) {
          const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
          const usedPercentage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

          if (usedPercentage > 80) {
            console.warn(`High memory usage: ${usedPercentage.toFixed(2)}%`);
          }
        }
      };

      const memoryInterval = setInterval(checkMemory, 30000); // Check every 30 seconds

      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }
  }, []);

  return <>{children}</>;
};

export default PerformanceMonitor;
