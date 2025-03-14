import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { destinations } from '../assets/destinations.ts';
import { TripPlan, TripDay } from '../types';

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

    setIsDateSelected(true); // Dátumok kiválasztása után megjelenítjük a fő tartalmat
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
              <li>Places to visit</li>
              <li>Untitled</li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <h2>Itinerary</h2>
            </div>
            <ul className="section-items">
              {tripPlan.days.map((day, index) => (
                <li
                  key={day.date}
                  onClick={() => handleDayClick(day)}
                  className={selectedDay?.date === day.date ? 'selected-day' : ''}
                >
                  Day {index + 1} - {new Date(day.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <h2>Budget</h2>
            </div>
            <ul className="section-items">
              <li>View</li>
            </ul>
          </div>

          <div className="sidebar-footer">
            <button>Hide sidebar</button>
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="hero-section">
          <h1>Trip to {destination.title}</h1>
          <div className="trip-info">
            <div className="date-range">
              {selectedDates.start && selectedDates.end
                ? `${selectedDates.start} to ${selectedDates.end}`
                : 'Select your dates'}
            </div>
            <div className="user-icons">
              <div className="user-avatar"></div>
              <div className="add-user"></div>
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
      </div>
    </div>
  );
};

export default TripPlanner;