import React from 'react';
import '../JourneyPal.css';

const Stats: React.FC = () => {
    return (
        <section className="stats">
            <div className="stat">
                <h2>8M+</h2>
                <p>Trips planned</p>
            </div>
            <div className="stat">
                <h2>33K+</h2>
                <p>Reviews</p>
            </div>
            <div className="stat">
                <h2>4.9*</h2>
                <p>Rating on App Store</p>
            </div>
            <div className="stat">
                <h2>4.7*</h2>
                <p>Rating on Google Play</p>
            </div>
        </section>
    );
};

export default Stats;