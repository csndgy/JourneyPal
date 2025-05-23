/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { destinations } from '../assets/destinations.ts';
import { TripPlan, TripDay, Destination, Event } from '../types';
import Checklist from './Checklist.tsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../Trip.css'
import api from '../Services/Interceptor.ts';
import destinationsFromJson from '../assets/destinations.json';
const IMAGE_MANIFEST = new Set([
  '/images/egypt-1.jpg',
  '/images/egypt-2.jpg',
  '/images/egypt-3.jpeg',
  '/images/egypt-4.jpg',
  '/images/egypt.jpg',
  '/images/farce-islands-1.jpg',
  '/images/farce-islands-2.jpg',
  '/images/farce-islands-3.jpg',
  '/images/farce-islands-4.jpg',
  '/images/farce-islands.jpg',
  '/images/ham.gif',
  '/images/kiskunfelegyhaza.png',
  '/images/machu-picchu.jpg',
  '/images/open.png',
  '/images/piltvice-lakes-1.jpg',
  '/images/piltvice-lakes-2.jpg',
  '/images/piltvice-lakes-3.jpg',
  '/images/piltvice-lakes-4.jpg',
  '/images/piltvice-lakes.jpg',
  '/images/profile.png',
  '/images/santorini-1.jpg',
  '/images/santorini-2.jpg',
  '/images/santorini-3.jpg',
  '/images/santorini-4.jpg',
  '/images/santorini.jpg',
  '/images/siva-oasis.jpg',
  '/images/tokyo-1.jpg',
  '/images/tokyo-2.jpg',
  '/images/tokyo-3.jpg',
  '/images/tokyo-4.jpg',
  '/images/tokyo.jpeg'
]);

interface Note {
  id: number;
  content: string;
}

const TripPlanner = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();

  const destination = destinations.find(d => d.id === Number(tripId)) ||
    (location.state?.destination ?
      {
        id: 'custom',
        title: location.state.destination,
        description: `Your trip to ${location.state.destination}`,
        coordinates: destinationsFromJson.find(d => 
          d.title.toLowerCase() === location.state.destination.toLowerCase()
        )?.coordinates || { lat: 0, lng: 0 },
        image: '/images/custom-destination.jpg',
        alt: 'Custom Destination'
      } :
      destinations[0]
    );

  // ... existing state declarations remain the same ...
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    startDate: '',
    endDate: '',
    days: [],
  });

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);
  const [showPlacesToVisit, setShowPlacesToVisit] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    name: '',
    description: '',
    location: '',
    links: '',
    time: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadNotes = async () => {
      try {
        if (!tripId) return;

        const response = await api.get(`/api/trips/${tripId}/notes`);
        setNotes(response.data.map((note: any) => ({
          id: note.id,
          content: note.content
        })));
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    };

    loadNotes();
  }, [tripId]);

  // Load events for the trip when component mounts or tripId changes
  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (!tripId) return;

        const response = await api.get(`/api/events/trip/${tripId}`);
        const events = response.data;

        if (events.length > 0 && tripPlan.days.length > 0) {
          const updatedDays = tripPlan.days.map(day => {
            const dayEvents = events
              .filter((event: any) => new Date(event.eventDate).toISOString().split('T')[0] === day.date)
              .map((event: any) => ({
                id: event.id.toString(),
                name: event.eventName,
                description: event.eventDescription,
                location: event.eventLocation,
                links: event.eventLinks?.join(', ') || '',
                time: event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                date: day.date
              }));

            return {
              ...day,
              events: dayEvents
            };
          });

          setTripPlan(prev => ({ ...prev, days: updatedDays }));
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };

    loadEvents();
  }, [tripId, tripPlan.days.length]);

  const validateEventForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newEvent.name.trim()) {
      errors.name = 'Event name is required';
    }

    if (!newEvent.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!newEvent.location.trim()) {
      errors.location = 'Location is required';
    }

    if (!newEvent.time.trim()) {
      errors.time = 'Time is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if trip details are passed from Your Trips page
  useEffect(() => {
    if (location.state) {
      const state = location.state as {
        tripId?: string,
        startDate?: string,
        endDate?: string,
        existingEvents?: Event[],
        tripName?: string,
        destination?: string
      };

      if (state.startDate && state.endDate) {
        // Fix: Use proper date handling to avoid timezone issues
        const start = new Date(state.startDate);
        const end = new Date(state.endDate);

        setStartDate(start);
        setEndDate(end);

        // Generate days for the entire duration
        const days: TripDay[] = [];
        const currentDate = new Date(start);
        currentDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);
        while (currentDate <= endDate) {
          const dateString = formatDateToLocalISOString(currentDate);
          const dayEvents = (state.existingEvents || [])
            .filter(event => event.date === dateString);

          days.push({
            date: dateString,
            activities: [],
            images: [],
            notes: [],
            events: dayEvents || []
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setTripPlan({
          startDate: formatDateToLocalISOString(start),
          endDate: formatDateToLocalISOString(end),
          days
        });
        setIsDateSelected(true);
        setCurrentPage(0);
      }
    }
  }, [location.state]);

  if (!destination) return <div className="error-message">Invalid destination</div>;

  // Helper function to format dates correctly without timezone issues
  const formatDateToLocalISOString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateDays = () => {
    if (!startDate || !endDate) return;

    const days: TripDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = formatDateToLocalISOString(currentDate);
      days.push({
        date: dateString,
        activities: [],
        images: [],
        notes: [],
        events: []
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setTripPlan({
      startDate: formatDateToLocalISOString(startDate),
      endDate: formatDateToLocalISOString(endDate),
      days
    });
    setIsDateSelected(true);
    setCurrentPage(0);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !tripId) return;

    try {
      const response = await api.post(`/api/trips/${tripId}/notes`, {
        content: newNote.trim()
      });

      setNotes([...notes, {
        id: response.data.id,
        content: newNote.trim()
      }]);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!tripId) return;

    try {
      await api.delete(`/api/trips/${tripId}/notes/${noteId}`);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleUpdateNote = async () => {
    if (editingNoteId === null || !tripId || !editingNoteContent.trim()) return;

    try {
      console.log(`/api/trips/${tripId}/notes/${editingNoteId}`);
      await api.patch(`/api/trips/${tripId}/notes/${editingNoteId}`, {
        content: editingNoteContent.trim(),
      });

      setNotes(notes.map(note =>
        note.id === editingNoteId
          ? { ...note, content: editingNoteContent.trim() }
          : note
      ));
      cancelEditingNote();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
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

  const handleAddEvent = async () => {
    if (!selectedDay || !tripId || !validateEventForm()) return;

    try {
      const eventData = {
        EventName: newEvent.name.trim(),
        EventDescription: newEvent.description.trim(),
        EventLocation: newEvent.location.trim(),
        EventLinks: newEvent.links ? newEvent.links.split(',').map(link => link.trim()).filter(link => link) : [],
        EventDate: new Date(`${selectedDay.date}T${newEvent.time}`),
        TripId: parseInt(tripId)
      };

      const response = await api.post('/api/events', eventData);
      const createdEvent = response.data;

      const eventWithId: Event = {
        id: createdEvent.id.toString(),
        name: createdEvent.eventName,
        description: createdEvent.eventDescription,
        location: createdEvent.eventLocation,
        links: createdEvent.eventLinks?.join(', ') || '',
        time: newEvent.time,
        date: selectedDay.date
      };

      const updatedDays = tripPlan.days.map(day => {
        if (day.date === selectedDay.date) {
          return {
            ...day,
            events: [...(day.events || []), eventWithId]
          };
        }
        return day;
      });

      setTripPlan(prev => ({ ...prev, days: updatedDays }));
      setSelectedDay(updatedDays.find(d => d.date === selectedDay.date) || null);
      resetEventForm();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedDay || !newEvent.id || !tripId || !validateEventForm()) return;

    try {
      const eventData = {
        EventName: newEvent.name.trim(),
        EventDescription: newEvent.description.trim(),
        EventLocation: newEvent.location.trim(),
        EventLinks: newEvent.links ? newEvent.links.split(',').map(link => link.trim()).filter(link => link) : [],
        EventDate: new Date(`${selectedDay.date}T${newEvent.time}`)
      };

      await api.patch(`/api/events/${newEvent.id}`, eventData);

      const updatedDays = tripPlan.days.map(day => {
        if (day.date === selectedDay.date) {
          return {
            ...day,
            events: day.events.map(event =>
              event.id === newEvent.id ? {
                ...event,
                name: newEvent.name.trim(),
                description: newEvent.description.trim(),
                location: newEvent.location.trim(),
                links: newEvent.links.trim(),
                time: newEvent.time
              } : event
            )
          };
        }
        return day;
      });

      setTripPlan(prev => ({ ...prev, days: updatedDays }));
      setSelectedDay(updatedDays.find(d => d.date === selectedDay.date) || null);
      resetEventForm();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/api/events/${eventId}`);

      const updatedDays = tripPlan.days.map(day => {
        if (day.date === selectedDay?.date) {
          return {
            ...day,
            events: day.events.filter(event => event.id !== eventId)
          };
        }
        return day;
      });

      setTripPlan(prev => ({ ...prev, days: updatedDays }));
      if (selectedDay) {
        setSelectedDay(updatedDays.find(d => d.date === selectedDay.date) || null);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const startEditingEvent = (event: Event) => {
    setNewEvent({
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      links: event.links,
      time: event.time
    });
    setIsEditing(true);
    setShowEventForm(true);
  };

  const resetEventForm = () => {
    setNewEvent({
      id: '',
      name: '',
      description: '',
      location: '',
      links: '',
      time: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setShowEventForm(false);
  };

  function checkIfImageExists(imagePath: string): boolean {
    return IMAGE_MANIFEST.has(imagePath);
  }

  const recommendPlaces = (destination: { title: string; description: string }, allDestinations: Destination[] = []) => {
    // Find matching destination
    const matchedDestination = allDestinations.find(dest =>
      dest.title.toLowerCase() === destination.title.toLowerCase()
    );

    // Use matched description if available
    const descriptionToUse = matchedDestination?.description || destination.description;

    // Process places
    const places = descriptionToUse.split(/[•-]/)
      .map(place => place.trim())
      .filter(place => place)
      .slice(0, 4);

    return places.map((place, index) => {
      const baseName = (matchedDestination || destination).title.toLowerCase().replace(/ /g, '-');

      // Try numbered images first (e.g., tokyo-1.jpg)
      const numberedImage = `/images/${baseName}-${index + 1}.jpg`;
      if (checkIfImageExists(numberedImage)) {
        return { name: place, image: numberedImage };
      }

      // Try alternative extensions for numbered images
      const jpegVariant = `/images/${baseName}-${index + 1}.jpeg`;
      if (checkIfImageExists(jpegVariant)) {
        return { name: place, image: jpegVariant };
      }

      // Fallback to main image if matched destination exists
      if (matchedDestination?.image && checkIfImageExists(matchedDestination.image)) {
        return { name: place, image: matchedDestination.image };
      }

      // Final fallback (for custom destinations)
      return {
        name: place,
        image: `/images/${baseName}-${index + 1}.jpg` // Will return 404 if doesn't exist
      };
    });
  };

  const recommendedPlaces = recommendPlaces(destination, destinationsFromJson);

  const daysPerPage = 7;
  const totalPages = Math.ceil(tripPlan.days.length / daysPerPage);
  const displayedDays = tripPlan.days.slice(
    currentPage * daysPerPage,
    (currentPage + 1) * daysPerPage
  );

  return (
    <div className="app-layout">
      <button
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      {isDateSelected && (
        <div className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
          <div className="overview-cards">
            <div
              className="overview-card"
              onClick={() => {
                setShowMap(true);
                setShowNotes(false);
                setShowChecklist(false);
                setShowPlacesToVisit(false);
                setSelectedDay(null);
                setIsMenuOpen(false);
              }}
            >
              <div className="card-icon">🗺️</div>
              <h3>Explore Map</h3>
              <p>Discover locations and plan routes</p>
            </div>
            <div
              className="overview-card"
              onClick={() => {
                setShowNotes(true);
                setShowMap(false);
                setShowChecklist(false);
                setShowPlacesToVisit(false);
                setSelectedDay(null);
                setIsMenuOpen(false);
              }}
            >
              <div className="card-icon">📝</div>
              <h3>Travel Notes</h3>
              <p>Capture your thoughts and ideas</p>
            </div>

            <div
              className="overview-card"
              onClick={() => {
                setShowChecklist(true);
                setShowNotes(false);
                setShowMap(false);
                setShowPlacesToVisit(false);
                setSelectedDay(null);
                setIsMenuOpen(false);
              }}
            >
              <div className="card-icon">✅</div>
              <h3>Packing List</h3>
              <p>Manage your travel essentials</p>


            </div>

            <div
              className="overview-card"
              onClick={() => {
                setShowPlacesToVisit(true);
                setShowMap(false);
                setShowNotes(false);
                setShowChecklist(false);
                setSelectedDay(null);
                setIsMenuOpen(false);
              }}
            >
              <div className="card-icon">🏛️</div>
              <h3>Destinations</h3>
              <p>Recommended places to visit</p>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <h2>Itinerary</h2>
            </div>
            <div className="section-items-container">
              <ul className="section-items">
                {displayedDays.map((day, index) => (
                  <li
                    key={day.date}
                    onClick={() => {
                      handleDayClick(day);
                      setIsMenuOpen(false);
                    }}
                    className={selectedDay?.date === day.date ? 'selected-day' : ''}
                  >
                    Day {(currentPage * daysPerPage) + index + 1} - {new Date(day.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
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
                  popperPlacement="bottom-start" />
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
                  popperPlacement="bottom-start" />
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
              src={destination.coordinates ? `https://www.google.com/maps?q=${destination.coordinates.lat},${destination.coordinates.lng}&z=12&output=embed` : ''}
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
                placeholder="Write your travel notes here..." />
              <button className="add-note-btn" onClick={handleAddNote}>
                Add Note
              </button>
            </div>
            <div className="notes-list">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        className="notes-input"
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                      />
                      <div className="note-actions">
                        <button
                          className="save-note-btn"
                          onClick={handleUpdateNote}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-note-btn"
                          onClick={cancelEditingNote}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{note.content}</p>
                      <div className="note-actions">
                        <button
                          className="edit-note-btn"
                          onClick={() => startEditingNote(note)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-note-btn"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : selectedDay ? (
          <div className="day-details">
            <h2>Day {tripPlan.days.findIndex(d => d.date === selectedDay.date) + 1}</h2>
            <p className="day-date">{new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

            {!showEventForm && (
              <button
                className="create-event-btn"
                onClick={() => {
                  setShowEventForm(true);
                  setIsEditing(false);
                  setNewEvent({
                    id: '',
                    name: '',
                    description: '',
                    location: '',
                    links: '',
                    time: ''
                  });
                }}
              >
                + Create Event
              </button>
            )}

            {showEventForm && (
              <div className="event-form">
                <h3>{isEditing ? 'Edit Event' : 'Create New Event'}</h3>
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newEvent.name}
                    onChange={handleEventChange}
                    placeholder="Enter event name" />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleEventChange} />
                  {formErrors.time && <span className="error-message">{formErrors.time}</span>}
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleEventChange}
                    placeholder="Enter event description" />
                  {formErrors.description && <span className="error-message">{formErrors.description}</span>}
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={newEvent.location}
                    onChange={handleEventChange}
                    placeholder="Enter location" />
                  {formErrors.location && <span className="error-message">{formErrors.location}</span>}
                </div>
                <div className="form-group">
                  <label>Links</label>
                  <input
                    type="text"
                    name="links"
                    value={newEvent.links}
                    onChange={handleEventChange}
                    placeholder="Enter relevant links (comma separated)" />
                </div>
                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={resetEventForm}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-btn"
                    onClick={isEditing ? handleEditEvent : handleAddEvent}
                  >
                    {isEditing ? 'Update Event' : 'Save Event'}
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
                      {event.links && (
                        <div className="event-detail">
                          <span className="detail-label">Links:</span>
                          {event.links && (
                            <a
                              href={event.links.startsWith('http') ? event.links : `https://${event.links}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                // Prevent navigation for invalid links
                                if (!/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(event.links)) {
                                  e.preventDefault();
                                  alert('Please enter a valid URL');
                                }
                              }}
                            >
                              {event.links}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="event-actions">
                      <button
                        className="edit-event-btn"
                        onClick={() => startEditingEvent(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-event-btn"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Delete
                      </button>
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
    </div >
  );
};

export default TripPlanner;