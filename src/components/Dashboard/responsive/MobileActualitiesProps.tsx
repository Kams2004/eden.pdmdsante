import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface Actuality {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
}

interface MobileActualitiesProps {
  actualities?: Actuality[];
}

const MobileActualities: React.FC<MobileActualitiesProps> = ({ 
  actualities = [
    {
      id: 1,
      title: "Nouveau Système de Gestion des Patients",
      date: "2024-03-15",
      description: "Mise à jour du système pour une meilleure prise en charge des patients avec de nouvelles fonctionnalités.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format"
    },
    {
      id: 2,
      title: "Formation sur les Nouvelles Procédures",
      date: "2024-03-12", 
      description: "Session de formation obligatoire sur les nouvelles procédures médicales et protocoles de sécurité.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&auto=format"
    },
    {
      id: 3,
      title: "Mise à Jour des Équipements Médicaux",
      date: "2024-03-10",
      description: "Installation de nouveaux équipements de diagnostic pour améliorer la qualité des soins.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format"
    },
    {
      id: 4,
      title: "Nouvelle Politique de Télémédecine",
      date: "2024-03-08",
      description: "Introduction de services de télémédecine pour étendre l'accès aux soins de santé.",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format"
    },
    {
      id: 5,
      title: "Amélioration du Système de Rapports",
      date: "2024-03-05",
      description: "Nouveaux outils de rapport pour un suivi plus efficace des patients et des résultats.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format"
    }
  ]
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Auto-switch functionality
  useEffect(() => {
    if (!actualities || actualities.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % actualities.length);
        setIsTransitioning(false);
      }, 150); // Half of transition duration
    }, 4000); // Switch every 4 seconds

    return () => clearInterval(interval);
  }, [actualities]);

  if (!actualities || !actualities.length) return null;

  const currentActuality = actualities[currentIndex];

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? actualities.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 150);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % actualities.length);
      setIsTransitioning(false);
    }, 150);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faNewspaper} className="text-blue-600 mr-2" size="lg" />
          <h2 className="text-lg font-bold text-gray-900">Actualités</h2>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>{currentIndex + 1}/{actualities.length}</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          disabled={isTransitioning}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50"
          type="button"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-gray-700" size="sm" />
        </button>
        
        <button
          onClick={goToNext}
          disabled={isTransitioning}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50"
          type="button"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-gray-700" size="sm" />
        </button>

        {/* Content Card */}
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 rounded-lg overflow-hidden shadow-sm">
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={currentActuality.image}
                alt={currentActuality.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                  {currentActuality.title}
                </h3>
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                  {currentActuality.date}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {currentActuality.description}
              </p>

              <div className="flex justify-end pt-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center">
                  <span>Lire plus</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-4">
        {actualities.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-blue-600 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            } disabled:opacity-50`}
            type="button"
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 bg-gray-200 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-75 ease-linear"
          style={{
            width: `${((currentIndex + 1) / actualities.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default MobileActualities;