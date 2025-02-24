import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/plan/${destination.id}`);
  };

  return (
    <div className="destination-card" onClick={handleClick}>
      <div className="card-image">
        <img src={destination.image} alt={destination.alt} />
      </div>
      <div className="card-content">
        <h2 className="card-title">{destination.title}</h2>
        <p className="card-description">{destination.description}</p>
      </div>
    </div>
  );
};

export default DestinationCard;