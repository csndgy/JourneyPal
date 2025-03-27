import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { destinations } from '../assets/destinations.ts';
import { TripPlan, TripDay, Destination } from '../types';
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
        notes: []
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
              }}>Explore</li>
              <li onClick={() => { 
                setShowNotes(true);
                setShowMap(false);
                setShowChecklist(false);
                setShowPlacesToVisit(false);
              }}>Notes</li>
              <li onClick={() => { 
                setShowChecklist(true);
                setShowNotes(false);
                setShowMap(false);
                setShowPlacesToVisit(false);
              }}>Checklist</li>
              <li onClick={() => { 
                setShowPlacesToVisit(true);
                setShowMap(false);
                setShowNotes(false);
                setShowChecklist(false);
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
                  onClick={() => setSelectedDay(day)}
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
            
           
                            <div className="uploaded-images">
                {selectedDay.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={URL.createObjectURL(image)}
                    alt={`Day ${new Date(selectedDay.date).toLocaleDateString()} Image ${imgIndex + 1}`}
                    className="uploaded-image"
                  />
                ))}
              </div>
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