import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { destinations } from '../assets/destinations.ts';
import { TripPlan, TripDay, Destination } from '../types';

const TripPlanner = () => {
  const { destinationId } = useParams<{ destinationId: string }>();
  const destination = destinations.find(d => d.id === Number(destinationId));

  if (!destination) {
    return <div>Destination not found</div>;
  }

  const [tripPlan, setTripPlan] = useState<TripPlan>({
    startDate: '',
    endDate: '',
    days: [],
  });

  const [selectedDates, setSelectedDates] = useState({
    start: '',
    end: '',
  });

  const [isDateSelected, setIsDateSelected] = useState(false);
  const [selectedDay, setSelectedDay] = useState<TripDay | null>(null);
  const [showPlacesToVisit, setShowPlacesToVisit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Új állapot az oldalszámozáshoz

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedDates((prev) => ({ ...prev, [name]: value }));
  };

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
      });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    setTripPlan({
      startDate: selectedDates.start,
      endDate: selectedDates.end,
      days,
    });

    setIsDateSelected(true);
    setCurrentPage(0); // Visszaállítjuk az oldalszámozást az első oldalra
  };

  const handleImageUpload = (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDays = [...tripPlan.days];
      newDays[dayIndex].images = Array.from(files);
      setTripPlan({ ...tripPlan, days: newDays });
    }
  };

  const handleDayClick = (day: TripDay) => {
    setSelectedDay(day);
  };

  // Function to recommend 3 places from the destination's description
  const recommendPlaces = (destination: Destination) => {
    const places = destination.description.split('•').map(place => place.trim());
    return places.slice(0, 4).map((place, index) => ({
      name: place,
      image: `/images/${destination.title.toLowerCase().replace(/ /g, '-')}-${index + 1}.jpg`, // Képek elérési útja
    }));
  };

  const recommendedPlaces = recommendPlaces(destination);

  // Napok kiválasztása az aktuális oldal alapján
  const daysPerPage = 7;
  const totalPages = Math.ceil(tripPlan.days.length / daysPerPage);
  const startIndex = currentPage * daysPerPage;
  const endIndex = startIndex + daysPerPage;
  const displayedDays = tripPlan.days.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="app-layout">
      {isDateSelected && (
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="section-header">
              <h2>Overview</h2>
            </div>
            <ul className="section-items">
              <li>Explore</li>
              <li>Notes</li>
              <li onClick={() => setShowPlacesToVisit(!showPlacesToVisit)}>Places to visit</li>
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
                  Day {startIndex + index + 1} - {new Date(day.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
            {/* Oldalszámozás gombjai */}
            <div className="pagination">
              <button className='btnPrevNext' onClick={handlePrevPage} disabled={currentPage === 0}>
                Previous
              </button>
              <span>Page {currentPage + 1} of {totalPages}</span>
              <button className='btnPrevNext' onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
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
                    <img
                      src={place.image}
                      alt={place.name}
                    />
                  </div>
                  <div className="recommended-card-content">
                    <h3 className="recommended-card-title">{place.name}</h3>
                    <p className="recommended-card-description">{`Explore ${place.name} in ${destination.title}`}</p>
                  </div>
                </div>
              ))}
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

            {!isDateSelected ? (
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
            ) : (
              <div className="planner-container">
                {selectedDay ? (
                  <div className="day-details">
                    <h2>Day Details - {new Date(selectedDay.date).toLocaleDateString()}</h2>
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
                          handleImageUpload(dayIndex, e);
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
                  <p>Select a day from the sidebar to view details.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;