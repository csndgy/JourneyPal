/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import '../Trip.css';
import { Trip } from '../types';
import api from '../Services/Interceptor';

const YourTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get('/api/trips');
        
        const tripsData = response.data.map((trip: any) => {
          // Debug raw trip data
          
          // Use the correct property names (camelCase as shown in API response)
          const tripData = {
            id: trip.id || 0,
            name: trip.tripName || 'Unnamed Trip',
            destination: trip.destination || 'Unknown Destination',
            startDate: trip.startDate ? new Date(trip.startDate).toISOString() : new Date().toISOString(),
            endDate: trip.endDate ? new Date(trip.endDate).toISOString() : new Date().toISOString(),
            isCustom: true
          };
          
          return tripData;
        });
    
        setTrips(tripsData);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDeleteTrip = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/trips/${id}`);
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== id));
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip. Please try again.');
    }
  };


  const formatDate = (dateInput: string | Date) => {
    // If it's already a Date object, use it directly
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateInput);
      return 'Invalid date';
    }
  
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="your-trips-container">
        <h1>Your Trips</h1>
        <div className="empty-state">Loading your trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="your-trips-container">
        <h1>Your Trips</h1>
        <div className="error-state">{error}</div>
      </div>
    );
  }

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
              onClick={() => navigate(`/plan/${trip.id}`, {
                state: {
                  tripId: trip.id,
                  destination: trip.destination,
                  startDate: trip.startDate,
                  endDate: trip.endDate,
                  isCustom: true
                }
              })}
            >
              <h3>{trip.name}</h3>
              <p>Destination: {trip.destination}</p>
              <p>Dates: {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
              <div className="trip-card-actions">
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteTrip(trip.id, e)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourTrips;