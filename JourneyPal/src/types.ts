// types.ts
export interface Destination {
  id: number | string;
  image: string;
  alt: string;
  title: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  links: string;
  time: string;
  date?: string;  // Add optional date property
}

export interface TripDay {
  date: string;
  activities: string[];
  images: string[];
  notes: string[];
  events: Event[];
}

export interface TripPlan {
  startDate: string;
  endDate: string;
  days: TripDay[];
}

export interface ApiTrip {
  id: number;
  userId: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  isCustom: boolean;
}
export interface CreateTripDto {
  TripName: string;
  Destination: string;
  StartDate: Date;
  EndDate: Date;
}

export interface TripDto extends CreateTripDto {
  Id: number;
  UserId: string;
  Events: EventDto[];
}

export interface TripDetailsDto extends TripDto {
  Notes: TripNoteDto[];
}

export interface CreateEventDto {
  EventName: string;
  EventDescription?: string;
  EventLocation?: string;
  EventLinks?: string[];
  EventDate: Date;
  EventEstimatedTime: TimeSpan;
  TripId: number;
}

export interface EventDto extends CreateEventDto {
  Id: number;
}

export interface CreateTripNoteDto {
  Content: string;
}

export interface TripNoteDto extends CreateTripNoteDto {
  Id: number;
  CreatedAt: Date;
  TripId: number;
}

// Simple TimeSpan implementation for TypeScript
export class TimeSpan {
  constructor(
    public hours: number = 0,
    public minutes: number = 0,
    public seconds: number = 0
  ) {}

  toString() {
    return `${this.hours}h ${this.minutes}m`;
  }

  static fromString(timeString: string): TimeSpan {
    const [hours, minutes] = timeString.split(':').map(Number);
    return new TimeSpan(hours, minutes);
  }
}