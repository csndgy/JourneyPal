import React, { forwardRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import destinations from '../assets/destinations.json';
import { Destination } from '../assets/destinations';

interface PopularDestinationsProps {}

const PopularDestinations = forwardRef<HTMLDivElement, PopularDestinationsProps>((props, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = (destination: Destination) => {
    setIsLoading(true);
    navigate('/trip/new', {  // Changed to dedicated new trip route
      state: {
        destination: destination.title,
        coordinates: destination.coordinates,
        image: destination.image,
        alt: destination.alt,
        description: destination.description
      }
    });
  };

  return (
    <section className="destinations-section" id="popular-destinations" ref={ref}>
      {isLoading && (
        <div className="loading-screen">
          <img 
            src="/images/ham.gif"
            alt="Loading..." 
            className="loading-gif"
          />
          <p>Preparing Your Journey...</p>
        </div>
      )}

      <div className="destinations-grid">
        {destinations.map((destination: Destination) => (
          <div
            key={destination.id}
            className="destination-card"
            onClick={() => handleClick(destination)}
          >
            <div className="card-image">
              <img src={destination.image} alt={destination.alt} />
            </div>
            <div className="card-content">
              <h3 className="card-title">{destination.title}</h3>
              <p className="card-description">{destination.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export default PopularDestinations;