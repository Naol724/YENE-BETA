import React, { useEffect, useState } from 'react';
import { MEDIA_PLACEHOLDER, resolveMediaUrl } from '../utils/mediaUrl';

type MediaImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  /** Fallback when src fails to load */
  fallbackSrc?: string;
};

/**
 * Renders listing / upload images with URL normalization and a safe fallback.
 */
export function MediaImage({
  src,
  alt = '',
  className,
  fallbackSrc = MEDIA_PLACEHOLDER,
  onError,
  ...rest
}: MediaImageProps) {
  const resolved = resolveMediaUrl(src);
  const [current, setCurrent] = useState(resolved);

  useEffect(() => {
    setCurrent(resolveMediaUrl(src));
  }, [src]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      className={className}
      loading={rest.loading ?? 'lazy'}
      decoding="async"
      onError={(e) => {
        if (current !== fallbackSrc) {
          setCurrent(fallbackSrc);
        }
        onError?.(e);
      }}
    />
  );
}

export default MediaImage;
