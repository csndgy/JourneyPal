import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { destinations } from '../assets/destinations.ts';
import { TripPlan, TripDay, Destination } from '../types';
import Checklist from './Checklist';

const TripPlanner = () => {
  const { destinationId } = useParams<{ destinationId: string }>();
  const destination = destinations.find(d => d.id === Number(destinationId));

  const [tripPlan, setTripPlan] = useState<TripPlan>({
    startDate: '',
    endDate: '',
    days: [],
  });
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });
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
    if (!selectedDates.start || !selectedDates.end) return;
    
    const start = new Date(selectedDates.start);
    const end = new Date(selectedDates.end);
    const days: TripDay[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      days.push({
        date: currentDate.toISOString().split('T')[0],
        activities: [],
        images: [],
        notes: []
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setTripPlan({ startDate: selectedDates.start, endDate: selectedDates.end, days });
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

  const handleDayNoteChange = (dayIndex: number, noteText: string) => {
    const updatedDays = [...tripPlan.days];
    if (!updatedDays[dayIndex].notes) {
      updatedDays[dayIndex].notes = [];
    }
    updatedDays[dayIndex].notes = [...updatedDays[dayIndex].notes, noteText];
    setTripPlan(prev => ({ ...prev, days: updatedDays }));
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
              <li 
                className={showMap ? 'active' : ''}
                onClick={() => { 
                  setShowMap(true); 
                  setShowNotes(false);
                  setShowChecklist(false);
                  setShowPlacesToVisit(false);
                }}
              >
                Explore
              </li>
              <li 
                className={showNotes ? 'active' : ''}
                onClick={() => { 
                  setShowNotes(true);
                  setShowMap(false);
                  setShowChecklist(false);
                  setShowPlacesToVisit(false);
                }}
              >
                Notes
              </li>
              <li 
                className={showChecklist ? 'active' : ''}
                onClick={() => { 
                  setShowChecklist(true);
                  setShowNotes(false);
                  setShowMap(false);
                  setShowPlacesToVisit(false);
                }}
              >
                Checklist
              </li>
              <li 
                className={showPlacesToVisit ? 'active' : ''}
                onClick={() => { 
                  setShowPlacesToVisit(true);
                  setShowMap(false);
                  setShowNotes(false);
                  setShowChecklist(false);
                }}
              >
                Places to visit
              </li>
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
                  onClick={() => {
                    setSelectedDay(day);
                    setShowMap(false);
                    setShowNotes(false);
                    setShowChecklist(false);
                    setShowPlacesToVisit(false);
                  }}
                  className={selectedDay?.date === day.date ? 'selected-day' : ''}
                >
                  Day {(currentPage * daysPerPage) + index + 1} - {new Date(day.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
            <div className="pagination">
              <button 
                className="btnPrevNext" 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </button>
              <span>Page {currentPage + 1} of {totalPages}</span>
              <button 
                className="btnPrevNext" 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {showPlacesToVisit ? (
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
            <div className="notes-container">
              <h3>Day Notes</h3>
              <div className="notes-input-container">
                <textarea
                  className="notes-input"
                  placeholder="Write notes for this day..."
                  onBlur={(e) => {
                    const dayIndex = tripPlan.days.findIndex(d => d.date === selectedDay.date);
                    handleDayNoteChange(dayIndex, e.target.value);
                  }}
                />
              </div>
              <div className="notes-list">
                {selectedDay.notes?.map((note, index) => (
                  <div key={index} className="note-card">
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </div>
            <textarea
              placeholder="What would you like to do on this day?"
              className="activity-input"
              value={selectedDay.activities.join('\n')}
              onChange={(e) => {
                const newDays = [...tripPlan.days];
                const dayIndex = tripPlan.days.findIndex((d) => d.date === selectedDay.date);
                newDays[dayIndex].activities = e.target.value.split('\n');
                setTripPlan({ ...tripPlan, days: newDays });
              }}
            />
            <div className="image-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const dayIndex = tripPlan.days.findIndex((d) => d.date === selectedDay.date);
                  const files = e.target.files;
                  if (files) {
                    const newDays = [...tripPlan.days];
                    newDays[dayIndex].images = Array.from(files);
                    setTripPlan({ ...tripPlan, days: newDays });
                  }
                }}
              />
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
          </div>
        ) : (
          <>
            <div className="hero-section">
              <h1>Trip to {destination.title}</h1>
              <div className="trip-info">
                <div className="date-range">
                  {selectedDates.start && selectedDates.end
                    ? `${selectedDates.start} to ${selectedDates.end}`
                    : 'Select your dates'}
                </div>
              </div>
            </div>

            {!isDateSelected && (
              <div className="date-picker-section">
                <h2>Plan Your Trip</h2>
                <div className="date-picker">
                  <input
                    type="date"
                    name="start"
                    value={selectedDates.start}
                    onChange={handleDateChange}
                    className="date-input"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    name="end"
                    value={selectedDates.end}
                    onChange={handleDateChange}
                    className="date-input"
                  />
                  <button onClick={generateDays} className="generate-btn">
                    Generate Plan
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;