import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { destinations } from '../assets/destinations';
import { Trip } from '../types';

interface TripFormData {
  tripName: string;
  destinationType: 'predefined' | 'custom';
  predefinedDestination: string;
  customDestination: string;
  startDate: Date | null;
  endDate: Date | null;
}

const PlanYourTrip: React.FC = () => {
  const [formData, setFormData] = useState<TripFormData>({
    tripName: '',
    destinationType: 'predefined',
    predefinedDestination: '',
    customDestination: '',
    startDate: null,
    endDate: null
  });
  
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({
    tripName: '',
    destination: '',
    dates: '',
    general: ''
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigateToPlanner();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const validateForm = () => {
    const newErrors = {
      tripName: '',
      destination: '',
      dates: '',
      general: ''
    };

    // Name validation
    if (!formData.tripName.trim()) {
      newErrors.tripName = 'Please provide a trip name!';
    }

    // Destination validation
    if (formData.destinationType === 'predefined' && !formData.predefinedDestination) {
      newErrors.destination = 'Please select a destination from the list!';
    }
    if (formData.destinationType === 'custom' && !formData.customDestination.trim()) {
      newErrors.destination = 'Please provide a custom destination!';
    }

    // Date validation
    if (!formData.startDate || !formData.endDate) {
      newErrors.dates = 'Both dates are required!';
    } else if (formData.startDate > formData.endDate) {
      newErrors.dates = 'End date cannot be earlier than start date!';
    } else if (formData.startDate < new Date(new Date().setHours(0,0,0,0))) {
      newErrors.dates = 'Start date cannot be in the past!';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const checkDuplicateTrip = () => {
    const existingTrips: Trip[] = JSON.parse(localStorage.getItem('trips') || '[]');
    return existingTrips.some(trip => 
      trip.name.toLowerCase() === formData.tripName.toLowerCase() &&
      new Date(trip.startDate).getTime() === formData.startDate?.getTime() &&
      new Date(trip.endDate).getTime() === formData.endDate?.getTime()
    );
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (checkDuplicateTrip()) {
      setErrors({ ...errors, general: 'A trip with this name and dates already exists!' });
      return;
    }

    const newTrip: Trip = {
      id: Date.now(),
      name: formData.tripName.trim(),
      destination: formData.destinationType === 'custom' 
        ? formData.customDestination.trim() 
        : formData.predefinedDestination,
      startDate: formData.startDate!.toISOString(),
      endDate: formData.endDate!.toISOString(),
      isCustom: formData.destinationType === 'custom'
    };

    const updatedTrips = [...JSON.parse(localStorage.getItem('trips') || '[]'), newTrip];
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    
    setShowSuccess(true);
    setErrors({ tripName: '', destination: '', dates: '', general: '' });
  };

  const navigateToPlanner = () => {
    const destination = formData.destinationType === 'custom'
      ? { 
          id: 'custom', 
          title: formData.customDestination,
          description: 'Custom Destination',
          image: '/images/custom-destination.jpg'
        }
      : destinations.find(d => d.title === formData.predefinedDestination);

    if (destination) {
      navigate(`/plan/${destination.id}`, { 
        state: {
          tripName: formData.tripName,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isCustom: formData.destinationType === 'custom'
        }
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="plan-your-trip-container">
      <h1 className="page-title">Plan a New Trip</h1>

      {errors.general && (
        <div className="error-message">
          ⚠️ {errors.general}
        </div>
      )}

      {showSuccess && (
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h3>Booking Successful!</h3>
          <p>
            {formData.tripName} trip to 
            <strong> {formData.destinationType === 'custom' 
              ? formData.customDestination 
              : formData.predefinedDestination}</strong>
          </p>
          <p className="trip-dates">
            {formatDate(formData.startDate!)} - {formatDate(formData.endDate!)}
          </p>
        </div>
      )}

      <form onSubmit={handleSaveTrip} className="trip-form">
        <div className="form-group">
          <label>Trip Name *</label>
          <input
            type="text"
            name="tripName"
            value={formData.tripName}
            onChange={(e) => setFormData({...formData, tripName: e.target.value})}
            className={errors.tripName ? 'has-error' : ''}
          />
          {errors.tripName && <span className="error-text">{errors.tripName}</span>}
        </div>

        <div className="form-group">
          <label>Destination Type *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="destinationType"
                value="predefined"
                checked={formData.destinationType === 'predefined'}
                onChange={() => setFormData({...formData, destinationType: 'predefined'})}
              />
              Select City
            </label>
            <label>
              <input
                type="radio"
                name="destinationType"
                value="custom"
                checked={formData.destinationType === 'custom'}
                onChange={() => setFormData({...formData, destinationType: 'custom'})}
              />
              Custom Destination
            </label>
          </div>
        </div>

        {formData.destinationType === 'predefined' ? (
          <div className="form-group">
            <label>Select City *</label>
            <select
              value={formData.predefinedDestination}
              onChange={(e) => setFormData({...formData, predefinedDestination: e.target.value})}
              className={errors.destination ? 'has-error' : ''}
            >
              <option value="">-- Select a Destination --</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.title}>{dest.title}</option>
              ))}
            </select>
            {errors.destination && <span className="error-text">{errors.destination}</span>}
          </div>
        ) : (
          <div className="form-group">
            <label>Custom Destination *</label>
            <input
              type="text"
              value={formData.customDestination}
              onChange={(e) => setFormData({...formData, customDestination: e.target.value})}
              className={errors.destination ? 'has-error' : ''}
              placeholder="Enter Destination"
            />
            {errors.destination && <span className="error-text">{errors.destination}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Travel Period *</label>
          <div className="date-range-container">
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData({...formData, startDate: date})}
              selectsStart
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={new Date()}
              dateFormat="yyyy. MMMM dd."
              placeholderText="Start Date"
              className={errors.dates ? 'has-error' : ''}
            />
            <span className="date-separator">–</span>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => setFormData({...formData, endDate: date})}
              selectsEnd
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={formData.startDate || new Date()}
              dateFormat="yyyy. MMMM dd."
              placeholderText="End Date"
              className={errors.dates ? 'has-error' : ''}
            />
          </div>
          {errors.dates && <span className="error-text">{errors.dates}</span>}
        </div>

        <button 
          type="submit" 
          className="save-btn"
          disabled={showSuccess}
        >
          {showSuccess ? 'Redirecting...' : 'Save Trip'}
        </button>
      </form>
    </div>
  );
};

export default PlanYourTrip;