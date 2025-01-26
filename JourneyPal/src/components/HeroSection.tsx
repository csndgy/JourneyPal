import React from 'react';
import '../JourneyPal.css';

const HeroSection: React.FC = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1 className="hero-slogan">Your Journey Starts Here</h1>
                <p className="hero-description">
                    Plan your next adventure with ease. Explore the world, one trip at a time.
                </p>
                <button className="hero-button">Travel</button>
            </div>
            <div className="google-maps">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13985378.709960699!2d128.06867546875002!3d38.27268853585937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x34674e0fd77f192f%3A0xf54275d47c665244!2sJapan!5e0!3m2!1sen!2sus!4v1698765432100!5m2!1sen!2sus"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </section>
    );
};

export default HeroSection;