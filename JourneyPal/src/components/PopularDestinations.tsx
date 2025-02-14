// src/components/PopularDestinations.tsx
import React from 'react';
import '../JourneyPal.css';

const PopularDestinations: React.FC = () => {
  const destinations = [
    {
      title: 'Tokyo',
      description: 'Experience the perfect blend of tradition and innovation',
      image: '/images/tokyo.jpeg'  // You'll need to add your images to the public folder
    },
    {
      title: 'Kyoto',
      description: 'Discover ancient temples and beautiful gardens',
      image: '/images/kyoto.jpg'
    },
    {
      title: 'Mount Fuji',
      description: 'Japans iconic mountain and natural wonder',
      image: '/images/mount-fuji.jpg'
    },
    {
      title: 'Osaka',
      description: 'Known for amazing street food and vibrant culture',
      image: '/images/osaka.jpg'
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