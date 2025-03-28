import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Trip.css';

interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  isCustom: boolean;
}

const YourTrips: React.FC = () => {
  const navigate = useNavigate();
  const trips: Trip[] = JSON.parse(localStorage.getItem('trips') || '[]');

  const handleTripClick = (trip: Trip) => {
    if (trip.isCustom) {
      navigate('/plan-your-trip/custom', {
        state: {
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate
        }
      });
    } else {
      navigate(`/plan-your-trip/${trip.id}`, {
        state: {
          startDate: trip.startDate,
          endDate: trip.endDate
        }
      });
    }
  };

  const handleDeleteTrip = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTrips = trips.filter(trip => trip.id !== id);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    window.location.reload(); // Refresh to show updated list
  };

  return (
    <div className="your-trips-container">
      <h1>Your Trips</h1>
      
      {trips.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any trips yet.</p>
          <button onClick={() => navigate('/plan-your-trip')}>Plan a new trip</button>
        </div>
      ) : (
        <div className="trips-list">
          {trips.map(trip => (
            <div 
              key={trip.id} 
              className="trip-card"
              onClick={() => handleTripClick(trip)}
            >
              <h3>{trip.name}</h3>
              <p>Destination: {trip.destination}</p>
              <p>Dates: {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
              <button 
                className="delete-btn"
                onClick={(e) => handleDeleteTrip(trip.id, e)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourTrips;