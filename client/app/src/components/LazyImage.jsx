import React, { useState, useRef, useEffect, memo } from "react";
import { Box, Skeleton } from "@mui/material";

const LazyImage = memo(
  ({ src, alt, width, height, sx = {}, placeholder = true, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
      setIsLoaded(true);
    };

    return (
      <Box
        ref={imgRef}
        sx={{
          width,
          height,
          position: "relative",
          overflow: "hidden",
          ...sx,
        }}
        {...props}
      >
        {placeholder && !isLoaded && (
          <Skeleton
            variant="rectangular"
            width={width}
            height={height}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />
        )}

        {isInView && (
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 0.3s ease",
              opacity: isLoaded ? 1 : 0,
              position: "relative",
              zIndex: 2,
            }}
            loading="lazy"
          />
        )}
      </Box>
    );
  }
);

LazyImage.displayName = "LazyImage";

export default LazyImage;
