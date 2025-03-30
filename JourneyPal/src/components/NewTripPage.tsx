import  { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../Services/Interceptor';
import '../Trip.css';

const NewTripPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleCreateTrip = async () => {
    if (!startDate || !endDate || !location.state) return;

    try {
      const response = await api.post('/api/trips', {
        tripName: `Trip to ${location.state.destination}`,
        destination: location.state.destination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      navigate(`/plan/${response.data.id}`, {
        state: {
          startDate: response.data.startDate,
          endDate: response.data.endDate,
          tripId: response.data.id,
          destination: location.state.destination,
          coordinates: location.state.coordinates
        }
      });
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <div className="ios-date-picker-container">
      <h1 className="destination-title">Plan your trip to {location.state?.destination}</h1>
      <div className="ios-date-picker">
        <h2>Select Travel Dates</h2>
        <div className="date-range-container">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            placeholderText="Start Date"
            className="ios-date-input"
            dateFormat="MMMM d, yyyy"
          />
          <span className="date-range-separator">to</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            className="ios-date-input"
            dateFormat="MMMM d, yyyy"
          />
        </div>
        <button
          onClick={handleCreateTrip}
          className="generate-btn"
          disabled={!startDate || !endDate}
        >
          Create Trip
        </button>
      </div>
    </div>
  );
};

export default NewTripPage;