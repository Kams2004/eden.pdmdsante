import React, { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';

interface Actuality {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
  link: string;
}

interface ActualitiesProps {
  actualities: Actuality[];
}

const Actualities: React.FC<ActualitiesProps> = ({ actualities }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector('.animate-scroll');
    if (scrollContainer) {
      if (isHovered) {
        scrollContainer.style.animationPlayState = 'paused';
      } else {
        scrollContainer.style.animationPlayState = 'running';
      }
    }
  }, [isHovered]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Actualities</h2>
        <Newspaper className="w-5 h-5 text-blue-600" />
      </div>
      <div className="relative overflow-hidden">
        <div 
          className="flex space-x-4 animate-scroll"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {[...actualities, ...actualities].map((actuality, index) => (
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
                  />
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-base text-gray-800 group-hover:text-blue-600 transition-colors duration-300 truncate">
                    {actuality.title}
                  </h3>
                  <p className="text-xs text-gray-500">{actuality.date}</p>
                  <p className="text-gray-600 text-sm line-clamp-1">{actuality.description}</p>
                  <div className="flex justify-end pt-1">
                    <a
                      href={actuality.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-button border border-blue-600 bg-white text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-50 transition-colors duration-300"
                    >
                      View...
                    </a>
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