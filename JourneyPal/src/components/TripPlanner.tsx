import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { destinations } from '../assets/destinations.ts';
import { TripPlan, TripDay, Destination, Event } from '../types';
import Checklist from './Checklist.tsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TripPlanner = () => {
  const { destinationId } = useParams<{ destinationId: string }>();
  const destination = destinations.find(d => d.id === Number(destinationId));

  const [tripPlan, setTripPlan] = useState<TripPlan>({
    startDate: '',
    endDate: '',
    days: [],
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);
  const [showPlacesToVisit, setShowPlacesToVisit] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    name: '',
    description: '',
    location: '',
    duration: '',
    links: '',
    time: ''
  });

  if (!destination) return <div>Destination not found</div>;

  const generateDays = () => {
    if (!startDate || !endDate) return;
    
    const days: TripDay[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push({
        date: currentDate.toISOString().split('T')[0],
        activities: [],
        images: [],
        notes: [],
        events: []
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setTripPlan({ 
      startDate: startDate.toISOString().split('T')[0], 
      endDate: endDate.toISOString().split('T')[0], 
      days 
    });
    setIsDateSelected(true);
    setCurrentPage(0);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote('');
    }
  };

  const handleDeleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleDayClick = (day: TripDay) => {
    // Reset all view states when selecting a day
    setShowMap(false);
    setShowNotes(false);
    setShowChecklist(false);
    setShowPlacesToVisit(false);
    
    setSelectedDay(day);
    setShowEventForm(false);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = () => {
    if (!selectedDay || !newEvent.name.trim()) return;
    
    const updatedDays = tripPlan.days.map(day => {
      if (day.date === selectedDay.date) {
        return {
          ...day,
          events: [...(day.events || []), newEvent]
        };
      }
      return day;
    });

    setTripPlan(prev => ({ ...prev, days: updatedDays }));
    setSelectedDay(updatedDays.find(d => d.date === selectedDay.date) || null);
    setNewEvent({
      name: '',
      description: '',
      location: '',
      duration: '',
      links: '',
      time: ''
    });
    setShowEventForm(false);
  };

  const recommendPlaces = (destination: Destination) => {
    return destination.description.split('•')
      .slice(0, 4)
      .map((place, index) => ({
        name: place.trim(),
        image: `/images/${destination.title.toLowerCase().replace(/ /g, '-')}-${index + 1}.jpg`
      }));
  };

  const recommendedPlaces = recommendPlaces(destination);

  const daysPerPage = 7;
  const totalPages = Math.ceil(tripPlan.days.length / daysPerPage);
  const displayedDays = tripPlan.days.slice(
    currentPage * daysPerPage,
    (currentPage + 1) * daysPerPage
  );

  return (
    <div className="app-layout">
      {isDateSelected && (
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="section-header">
              <h2>Overview</h2>
            </div>
            <ul className="section-items">
              <li onClick={() => { 
                setShowMap(true); 
                setShowNotes(false);
                setShowChecklist(false);
                setShowPlacesToVisit(false);
                setSelectedDay(null);
              }}>Explore</li>
              <li onClick={() => { 
                setShowNotes(true);
                setShowMap(false);
                setShowChecklist(false);
                setShowPlacesToVisit(false);
                setSelectedDay(null);
              }}>Notes</li>
              <li onClick={() => { 
                setShowChecklist(true);
                setShowNotes(false);
                setShowMap(false);
                setShowPlacesToVisit(false);
                setSelectedDay(null);
              }}>Checklist</li>
              <li onClick={() => { 
                setShowPlacesToVisit(true);
                setShowMap(false);
                setShowNotes(false);
                setShowChecklist(false);
                setSelectedDay(null);
              }}>Places to visit</li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <h2>Itinerary</h2>
            </div>
            <ul className="section-items">
              {displayedDays.map((day, index) => (
                <li
                  key={day.date}
                  onClick={() => handleDayClick(day)}
                  className={selectedDay?.date === day.date ? 'selected-day' : ''}
                >
                  Day {(currentPage * daysPerPage) + index + 1} - {new Date(day.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
            <div className="pagination-container">
              <button 
                className="btn-prev" 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                ➜
              </button>
              <span className="page-info">Page {currentPage + 1} of {totalPages}</span>
              <button 
                className="btn-next" 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
              >
                ➜
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {!isDateSelected ? (
          <div className="ios-date-picker-container">
            <h1 className="destination-title">Trip to {destination.title}</h1>
            <div className="ios-date-picker">
              <h2>Select Travel Dates</h2>
              <div className="date-range-container">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  placeholderText="Start Date"
                  className="ios-date-input"
                  dateFormat="MMMM d, yyyy"
                  calendarClassName="ios-calendar"
                  popperPlacement="bottom-start"
                />
                <span className="date-range-separator">to</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  minDate={startDate || undefined}
                  placeholderText="End Date"
                  className="ios-date-input"
                  dateFormat="MMMM d, yyyy"
                  calendarClassName="ios-calendar"
                  popperPlacement="bottom-start"
                />
              </div>
              <button 
                onClick={generateDays} 
                className="generate-btn"
                disabled={!startDate || !endDate}
              >
                Generate Itinerary
              </button>
            </div>
          </div>
        ) : showPlacesToVisit ? (
          <div className="recommended-places-container">
            <h2>Recommended Places to Visit</h2>
            <div className="recommended-places-grid">
              {recommendedPlaces.map((place, index) => (
                <div key={index} className="recommended-place-card">
                  <div className="recommended-card-image">
                    <img src={place.image} alt={place.name} />
                  </div>
                  <div className="recommended-card-content">
                    <h3 className="recommended-card-title">{place.name}</h3>
                    <p className="recommended-card-description">
                      Explore {place.name} in {destination.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : showMap ? (
          <div className="map-container">
            <iframe
              width="100%"
              height="600"
              src={`https://www.google.com/maps?q=${destination.coordinates.lat},${destination.coordinates.lng}&z=12&output=embed`}
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
        ) : showChecklist ? (
          <Checklist />
        ) : showNotes ? (
          <div className="notes-container">
            <h2>Travel Notes</h2>
            <div className="notes-input-container">
              <textarea
                className="notes-input"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your travel notes here..."
              />
              <button className="add-note-btn" onClick={handleAddNote}>
                Add Note
              </button>
            </div>
            <div className="notes-list">
              {notes.map((note, index) => (
                <div key={index} className="note-card">
                  <p>{note}</p>
                  <button 
                    className="delete-note-btn"
                    onClick={() => handleDeleteNote(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : selectedDay ? (
          <div className="day-details">
            <h2>Day {tripPlan.days.findIndex(d => d.date === selectedDay.date) + 1}</h2>
            <p className="day-date">{new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            
            {!showEventForm ? (
              <button 
                className="create-event-btn"
                onClick={() => setShowEventForm(true)}
              >
                + Create Event
              </button>
            ) : (
              <div className="event-form">
                <h3>Create New Event</h3>
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
                <div className="form-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowEventForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn"
                    onClick={handleAddEvent}
                    disabled={!newEvent.name.trim()}
                  >
                    Save Event
                  </button>
                </div>
              </div>
            )}

            {selectedDay.events && selectedDay.events.length > 0 && (
              <div className="events-list">
                <h3>Scheduled Events</h3>
                {selectedDay.events.map((event, index) => (
                  <div key={index} className="event-card">
                    <div className="event-time">{event.time}</div>
                    <div className="event-content">
                      <h4>{event.name}</h4>
                      {event.description && <p>{event.description}</p>}
                      {event.location && (
                        <div className="event-detail">
                          <span className="detail-label">Location:</span>
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.duration && (
                        <div className="event-detail">
                          <span className="detail-label">Duration:</span>
                          <span>{event.duration}</span>
                        </div>
                      )}
                      {event.links && (
                        <div className="event-detail">
                          <span className="detail-label">Links:</span>
                          <a href={event.links} target="_blank" rel="noopener noreferrer">
                            {event.links}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
        ) : (
          <div className="welcome-message">
            <h2>Welcome to your {destination.title} trip!</h2>
            <p>Select an option from the sidebar to start planning.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;