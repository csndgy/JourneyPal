import destinations from '../assets/destinations.json';

const PopularDestinations = () => {
  return (
    <section className="destinations-section">
      <div className="destinations-grid">
        {destinations.map((destination) => (
          <div key={destination.id} className="destination-card">
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
};

export default PopularDestinations;