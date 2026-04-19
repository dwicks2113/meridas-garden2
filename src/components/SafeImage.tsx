"use client";

// Client-side <img> wrapper that hides itself if the source 404s.
// Usable inside server components because the component itself is a client boundary.

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function SafeImage({ src, alt, className, ...rest }: SafeImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
      {...rest}
    />
  );
}
