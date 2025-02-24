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
    days: []
  });

  const [selectedDates, setSelectedDates] = useState({
    start: '',
    end: ''
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedDates(prev => ({
      ...prev,
      [name]: value
    }));
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
        images: [] // Add images array to each day
      });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    setTripPlan({
      startDate: selectedDates.start,
      endDate: selectedDates.end,
      days
    });
  };

  const handleImageUpload = (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDays = [...tripPlan.days];
      newDays[dayIndex].images = Array.from(files);
      setTripPlan({ ...tripPlan, days: newDays });
    }
  };

  return (
    <div className="trip-planner-container">
      <div className="trip-planner-card">
        <div className="trip-header">
          <img 
            src={destination?.image} 
            alt={destination?.alt} 
            className="destination-hero"
          />
          <div className="trip-title">
            <h1>Trip to {destination?.title}</h1>
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
              <button 
                onClick={generateDays}
                className="generate-btn"
              >
                Plan Trip
              </button>
            </div>
          </div>
        </div>

        <div className="planner-container">
          <div className="places-sidebar">
            <div className="places-header">
              <h2>Your Itinerary</h2>
            </div>
            <div className="selected-places">
              {tripPlan.days.map((day, index) => (
                <div key={day.date} className="day-plan">
                  <h3>Day {index + 1} - {new Date(day.date).toLocaleDateString()}</h3>
                  <textarea
                    placeholder="What would you like to do on this day?"
                    className="activity-input"
                    value={day.activities.join('\n')}
                    onChange={(e) => {
                      const newDays = [...tripPlan.days];
                      newDays[index].activities = e.target.value.split('\n');
                      setTripPlan({ ...tripPlan, days: newDays });
                    }}
                  />
                  <div className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(index, e)}
                    />
                    <div className="uploaded-images">
                      {day.images.map((image, imgIndex) => (
                        <img 
                          key={imgIndex} 
                          src={URL.createObjectURL(image)} 
                          alt={`Day ${index + 1} Image ${imgIndex + 1}`} 
                          className="uploaded-image"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
         {/*} <div className="map-container">
            <div className="map-placeholder">
              <p>Google Maps Integration Coming Soon</p>
            </div>
          </div>*/}
        </div>
          <button>Save</button>
      </div>
    </div>
  );
};

export default TripPlanner;