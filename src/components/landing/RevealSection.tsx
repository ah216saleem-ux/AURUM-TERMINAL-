import React, { useEffect, useRef, useState } from 'react';

interface RevealSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  delayMs?: number;
}

export const RevealSection: React.FC<RevealSectionProps> = ({
  children,
  id,
  className = '',
  delayMs = 0
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setIsRevealed(true), delayMs);
          } else {
            setIsRevealed(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`transition-all duration-1000 ease-out ${
        isRevealed
          ? 'opacity-100 translate-y-0 filter blur-0'
          : 'opacity-0 translate-y-10 filter blur-[6px]'
      } ${className}`}
    >
      {children}
    </section>
  );
};
