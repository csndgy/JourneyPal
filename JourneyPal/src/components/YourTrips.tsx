import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import '../Trip.css';
import { Trip, Event } from '../types';
import { destinations } from '../assets/destinations';

const YourTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>(
    JSON.parse(localStorage.getItem('trips') || '[]')
  );
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    name: '',
    description: '',
    location: '',
    duration: '',
    links: '',
    time: ''
  });

  const handleTripClick = (trip: Trip) => {
    // Find the destination ID for predefined destinations
    const destination = trip.isCustom 
      ? { id: 'custom' } 
      : destinations.find(d => d.title === trip.destination);

    // Navigate to trip planner with trip details
    navigate(`/plan/${destination?.id || 'custom'}`, {
      state: {
        tripName: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        isCustom: trip.isCustom,
        existingEvents: trip.events || []
      }
    });
  };

  const handleDeleteTrip = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTrips = trips.filter(trip => trip.id !== id);
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = () => {
    if (!selectedTrip || !newEvent.name.trim()) return;
    
    const eventWithId: Event = {
      ...newEvent,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTrip.id) {
        // If trip doesn't have events array, initialize it
        const existingEvents = trip.events || [];
        return {
          ...trip,
          events: [...existingEvents, eventWithId]
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    setSelectedTrip(updatedTrips.find(t => t.id === selectedTrip.id) || null);
    
    // Reset event form
    setNewEvent({
      id: '',
      name: '',
      description: '',
      location: '',
      duration: '',
      links: '',
      time: ''
    });
  };

  const handleEditTrip = (trip: Trip) => {
    navigate('/plan-your-trip', {
      state: {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        isCustom: trip.isCustom,
        tripName: trip.name,
        tripId: trip.id  // Pass the trip ID to identify which trip is being edited
      }
    });
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
              className={`trip-card ${selectedTrip?.id === trip.id ? 'selected' : ''}`}
              onClick={() => handleTripClick(trip)}
            >
              <h3>{trip.name}</h3>
              <p>Destination: {trip.destination}</p>
              <p>Dates: {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
              <div className="trip-card-actions">
                <button 
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTrip(trip);
                  }}
                >
                  Edit
                </button>
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

      {selectedTrip && (
        <div className="trip-details">
          <h2>{selectedTrip.name} Details</h2>
          
          <div className="events-section">
            <h3>Add Event</h3>
            <div className="event-form">
              <div className="form-group">
                <label>Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={newEvent.name}
                  onChange={handleEventChange}
                  placeholder="Enter event name"
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleEventChange}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventChange}
                  placeholder="Enter event description"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={newEvent.location}
                  onChange={handleEventChange}
                  placeholder="Enter location"
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={newEvent.duration}
                  onChange={handleEventChange}
                  placeholder="e.g. 2 hours"
                />
              </div>
              <div className="form-group">
                <label>Links</label>
                <input
                  type="text"
                  name="links"
                  value={newEvent.links}
                  onChange={handleEventChange}
                  placeholder="Enter relevant links"
                />
              </div>
              <button 
                className="save-event-btn"
                onClick={handleAddEvent}
                disabled={!newEvent.name.trim()}
              >
                Add Event
              </button>
            </div>

            {selectedTrip.events && selectedTrip.events.length > 0 && (
              <div className="existing-events">
                <h3>Scheduled Events</h3>
                {selectedTrip.events.map((event, index) => (
                  <div key={index} className="event-card">
                    <h4>{event.name}</h4>
                    {event.time && <p>Time: {event.time}</p>}
                    {event.description && <p>{event.description}</p>}
                    {event.location && <p>Location: {event.location}</p>}
                    {event.duration && <p>Duration: {event.duration}</p>}
                    {event.links && (
                      <a href={event.links} target="_blank" rel="noopener noreferrer">
                        Additional Info
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YourTrips;