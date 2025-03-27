import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { destinations } from '../assets/destinations';
import { Destination } from '../types';

const PlanYourTrip: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const handlePlaceClick = (destinationId: number) => {
    if (startDate && endDate) {
      navigate(`/plan/${destinationId}`, {
        state: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
    } else {
      navigate(`/plan/${destinationId}`);
    }
  };

  return (
    <div className="plan-your-trip-container">
      <h1 className="page-title">Plan Your Custom Trip</h1>
      
      <div className="map-section">
        <h2>Select Destinations on Map</h2>
        <div className="map-container">
          <iframe
            title="Destination Map"
            width="100%"
            height="500"
            src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=47.4979,19.0402&zoom=4`}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <div className="date-picker-section">
        <h2>Select Travel Dates</h2>
        <div className="ios-date-picker">
          <div className="date-range-container">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              placeholderText="Start Date"
              className="ios-date-input"
              dateFormat="MMMM d, yyyy"
              calendarClassName="ios-calendar"
              popperPlacement="bottom-start"
            />
            <span className="date-range-separator">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || new Date()}
              placeholderText="End Date"
              className="ios-date-input"
              dateFormat="MMMM d, yyyy"
              calendarClassName="ios-calendar"
              popperPlacement="bottom-start"
            />
          </div>
        </div>
      </div>

      <div className="recommended-places-container">
        <h2>Popular Destinations</h2>
        <div className="recommended-places-grid">
          {destinations.map((destination) => (
            <div 
              key={destination.id}
              className="recommended-place-card"
              onClick={() => handlePlaceClick(destination.id)}
            >
              <div className="recommended-card-image">
                <img src={destination.image} alt={destination.title} />
              </div>
              <div className="recommended-card-content">
                <h3 className="recommended-card-title">{destination.title}</h3>
                <p className="recommended-card-description">
                  {destination.description.split('•')[0].trim()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanYourTrip;