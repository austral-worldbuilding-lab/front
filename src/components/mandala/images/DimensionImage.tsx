import React, { useState, useEffect, useRef } from "react";
import { MandalaImage } from "@/types/mandala";

interface DimensionImageProps {
  image: MandalaImage;
  width?: number;
  height?: number;
}

const DimensionImage: React.FC<DimensionImageProps> = ({
  image,
  width = 80,
  height = 80,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !image.url) {
      if (!image.url) {
        setHasError(true);
        setIsLoading(false);
      }
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageSrc(image.url);
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.src = image.url;
  }, [image.url, isVisible]);

  if (hasError) {
    return (
      <div
        className="relative flex items-center justify-center bg-gray-200 border border-gray-300 rounded-[4px] text-gray-500"
        style={{
          width,
          height,
          boxShadow: "0 0 4px rgba(0,0,0,0.3)",
        }}
      >
        <span className="text-xs">Error</span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className="relative overflow-hidden rounded-[4px]"
      style={{
        width,
        height,
        boxShadow: "0 0 4px rgba(0,0,0,0.3)",
      }}
      title={`Imagen: ${image.id}`}
    >
      {(isLoading || !isVisible) && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
          style={{
            filter: "blur(2px)",
          }}
        >
          {isVisible && (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          )}
          {!isVisible && (
            <div className="w-6 h-6 bg-blue-300 rounded animate-pulse"></div>
          )}
        </div>
      )}

      {!isLoading && isVisible && imageSrc && (
        <img
          src={imageSrc}
          alt={`Imagen ${image.id}`}
          className="w-full h-full object-cover transition-all duration-500 ease-out"
          style={{
            borderRadius: "4px",
            filter: isLoading ? "blur(4px)" : "blur(0px)",
            opacity: isLoading ? 0.7 : 1,
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default DimensionImage;
