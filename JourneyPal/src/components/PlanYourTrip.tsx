/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CreateTripDto } from '../types';
import api from '../Services/Interceptor';

interface TripFormData {
  tripName: string;
  destinationType: 'predefined' | 'custom';
  predefinedDestination: string;
  customDestination: string;
  startDate: Date | null;
  endDate: Date | null;
  editingTripId?: number;
}

const PlanYourTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<TripFormData>({
    tripName: '',
    destinationType: 'predefined',
    predefinedDestination: '',
    customDestination: '',
    startDate: null,
    endDate: null
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({
    tripName: '',
    destination: '',
    dates: '',
    general: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);

  // Use pre-filled data if passed from Your Trips page for editing
  useEffect(() => {
    const state = location.state as { 
      destination?: string, 
      startDate?: string, 
      endDate?: string,
      isCustom?: boolean,
      tripName?: string,
      tripId?: number
    };

    if (state) {
      setIsEditing(!!state.tripId);
      setCurrentTripId(state.tripId || null);
      
      setFormData(prev => ({
        ...prev,
        tripName: state.tripName || '',
        destinationType: state.isCustom ? 'custom' : 'predefined',
        predefinedDestination: !state.isCustom ? state.destination || '' : '',
        customDestination: state.isCustom ? state.destination || '' : '',
        startDate: state.startDate ? new Date(state.startDate) : null,
        endDate: state.endDate ? new Date(state.endDate) : null,
        editingTripId: state.tripId
      }));
    }
  }, [location.state]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigateToNextStep();
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

    if (!formData.tripName.trim()) {
      newErrors.tripName = 'Please provide a trip name!';
    }

    if (formData.destinationType === 'predefined' && !formData.predefinedDestination) {
      newErrors.destination = 'Please select a destination from the list!';
    }
    if (formData.destinationType === 'custom' && !formData.customDestination.trim()) {
      newErrors.destination = 'Please provide a custom destination!';
    }

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
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    try {
      const destination = formData.destinationType === 'custom' 
        ? formData.customDestination.trim() 
        : formData.predefinedDestination;

      const tripData: CreateTripDto = {
        TripName: formData.tripName.trim(),
        Destination: destination,
        StartDate: formData.startDate!,
        EndDate: formData.endDate!
      };
      let response;

      if (isEditing && currentTripId) {
        // Update existing trip
          response = await api.put(`/api/trips/${currentTripId}`, tripData);
      } else {
        // Create new trip
        response = await api.post('/api/trips', tripData);
      }
      
      setShowSuccess(true);
      setErrors({ tripName: '', destination: '', dates: '', general: '' });
    } catch (error) {
      console.error('Error saving trip:', error);
      setErrors({ ...errors, general: 'Failed to save trip. Please try again.' });
    }
  };

  const navigateToNextStep = () => {

    // Navigate to trip planner with trip details
    navigate(`/trips`, { 
      state: {
        tripName: formData.tripName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCustom: formData.destinationType === 'custom',
        destination: formData.destinationType === 'custom' 
          ? formData.customDestination 
          : formData.predefinedDestination
      }
    });
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
      <h1 className="page-title">{isEditing ? 'Edit Trip' : 'Plan a New Trip'}</h1>

      {errors.general && (
        <div className="error-message">
          ⚠️ {errors.general}
        </div>
      )}

      {showSuccess && (
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h3>{isEditing ? 'Trip Updated!' : 'Booking Successful!'}</h3>
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

        {formData.destinationType === 'predefined' ? (
          <div className="form-group">
            <label>Destination *</label>
            <input
              type="text"
              value={formData.predefinedDestination}
              onChange={(e) => setFormData({...formData, predefinedDestination: e.target.value})}
              className={errors.destination ? 'has-error' : ''}
              placeholder="Enter destination name"
            />
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
          {showSuccess ? 'Redirecting...' : isEditing ? 'Update Trip' : 'Save Trip'}
        </button>
      </form>
    </div>
  );
};

export default PlanYourTrip;