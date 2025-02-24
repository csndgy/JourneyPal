import React, { forwardRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import destinations from '../assets/destinations.json';
import { Destination } from '../assets/destinations';

interface PopularDestinationsProps {}

const PopularDestinations = forwardRef<HTMLDivElement, PopularDestinationsProps>((props, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = (destinationId: number) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(`/plan/${destinationId}`);
    }, 2000);
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
            onClick={() => handleClick(destination.id)}
          >
            <Link to="#" className="destination-card-link">
              <div className="card-image">
                <img src={destination.image} alt={destination.alt} />
              </div>
              <div className="card-content">
                <h3 className="card-title">{destination.title}</h3>
                <p className="card-description">{destination.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
});

export default PopularDestinations;