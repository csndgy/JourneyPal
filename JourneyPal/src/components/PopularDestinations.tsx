const PopularDestinations = () => {
  return (
    <section className="destinations-section">
      <div className="destinations-grid">
        <div className="destination-card">
          <div className="card-image">
            <img src="/images/faroe-islands.jpg" alt="Faroe Islands" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Faroe Islands</h3>
            <p className="card-description">Dramatic Cliffs • Nordic Villages • Múlafossur Waterfall</p>
          </div>
        </div>
        <div className="destination-card">
          <div className="card-image">
            <img src="/images/tokyo.jpeg" alt="Tokyo" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Tokyo</h3>
            <p className="card-description">Tokyo Tower • Senso-ji Temple • Shibuya Crossing</p>
          </div>
        </div>
        <div className="destination-card">
          <div className="card-image">
            <img src="/images/plitvice-lakes.jpg" alt="Plitvice Lakes" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Plitvice Lakes</h3>
            <p className="card-description">Waterfalls • Natural Lakes • Ancient Forests</p>
          </div>
        </div>
        <div className="destination-card">
          <div className="card-image">
            <img src="/images/santorini.jpg" alt="Santorini" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Santorini</h3>
            <p className="card-description">White Villages • Aegean Sea • Sunset Views</p>
          </div>
        </div>
        <div className="destination-card">
          <div className="card-image">
            <img src="/images/siwa-oasis.jpg" alt="Siwa Oasis" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Siwa Oasis</h3>
            <p className="card-description">Desert Springs • Ancient Ruins • Palm Groves</p>
          </div>
        </div>
        <div className="destination-card">
          <div className="card-image">
            <img src="/images/cappadocia.jpg" alt="Cappadocia" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Cappadocia</h3>
            <p className="card-description">Hot Air Balloons • Cave Hotels • Rock Churches</p>
          </div>
        </div>
        <div className="destination-card">
          <div className="card-image">
            <img src="/images/machu-picchu.jpg" alt="Machu Picchu" />
          </div>
          <div className="card-content">
            <h3 className="card-title">Machu Picchu</h3>
            <p className="card-description">Inca Ruins • Andes Mountains • Sacred Valley</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;