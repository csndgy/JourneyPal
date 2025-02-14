// src/components/PopularDestinations.tsx
import React from 'react';
import '../JourneyPal.css';

const PopularDestinations: React.FC = () => {
    const destinations = [
        {
          title: 'Tokyo',
          description: 'Experience the perfect blend of tradition and innovation',
          image: '/images/tokyo.jpeg'
        },
        {
          title: 'Faroe Islands',
          description: 'A remote archipelago with stunning cliffs, waterfalls, and untouched landscapes',
          image: '/images/faroe-islands.jpg'
        },
        {
          title: 'Plitvice Lakes',
          description: 'A UNESCO World Heritage Site with cascading lakes and lush forests',
          image: '/images/plitvice-lakes.jpg'
        },
        {
          title: 'Siwa Oasis',
          description: 'A serene desert oasis with natural springs, palm groves, and ancient ruins',
          image: '/images/siwa-oasis.jpg'
        }
      ];

  return (
    <section className="destinations-section">
      <h2 className="destinations-title">Popular Destinations</h2>
      <div className="destinations-grid">
        {destinations.map((destination, index) => (
          <div key={index} className="destination-card">
            <div className="card-image">
              <img src={destination.image} alt={destination.title} />
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
};

export default PopularDestinations;