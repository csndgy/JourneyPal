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
  duration: string;
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

export interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  isCustom: boolean;
  events?: Event[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}