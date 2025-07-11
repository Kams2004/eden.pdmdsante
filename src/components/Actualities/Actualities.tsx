import React, { useEffect, useRef } from 'react';
import { Newspaper } from 'lucide-react';

interface Actuality {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
}

interface ActualitiesProps {
  actualities?: Actuality[];
}

const Actualities: React.FC<ActualitiesProps> = ({ actualities = [] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const scrollPositionRef = useRef(0);
  const animationIdRef = useRef<number>();
  const isHoveredRef = useRef(false);
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const scrollContent = scrollContentRef.current;
    
    if (!scrollContainer || !scrollContent || !actualities || actualities.length === 0) return;

    // Calculate the width of one complete set of actualities
    const itemWidth = 256 + 16; // w-64 = 256px + gap of 16px
    const totalWidth = itemWidth * actualities.length;
    const scrollSpeed = 0.3; // Slower speed - pixels per frame
    
    const scroll = () => {
      if (!isHoveredRef.current) {
        scrollPositionRef.current += scrollSpeed;
        
        // Reset position when we've scrolled past one complete set
        if (scrollPositionRef.current >= totalWidth) {
          scrollPositionRef.current = 0;
        }
        
        if (scrollContainer) {
          scrollContainer.scrollLeft = scrollPositionRef.current;
        }
      }
      
      animationIdRef.current = requestAnimationFrame(scroll);
    };

    // Mouse event handlers
    const handleMouseEnter = () => {
      isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    // Add event listeners
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    // Start the animation only if not already running
    if (!animationIdRef.current) {
      animationIdRef.current = requestAnimationFrame(scroll);
    }

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = undefined;
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []); // Empty dependency array - runs only once on mount

  if (!actualities || !actualities.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Actualities</h2>
        <Newspaper className="w-5 h-5 text-blue-600" />
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="relative overflow-hidden"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        <div 
          ref={scrollContentRef}
          className="flex space-x-4"
          style={{
            width: `${(256 + 16) * actualities.length * 3}px` // Triple width for seamless loop
          }}
        >
          {/* Render actualities 3 times for seamless loop */}
          {[...actualities, ...actualities, ...actualities].map((actuality, index) => (
            <div
              key={`${actuality.id}-${index}`}
              className="flex-none w-64 group"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="h-32 overflow-hidden">
                  <img
                    src={actuality.image}
                    alt={actuality.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-base text-gray-800 group-hover:text-blue-600 transition-colors duration-300 truncate">
                    {actuality.title}
                  </h3>
                  <p className="text-xs text-gray-500">{actuality.date}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{actuality.description}</p>
                  <div className="flex justify-end pt-1">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
                      View...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Actualities;