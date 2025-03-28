// types.ts
export interface Destination {
  id: number;
  image: string;
  alt: string; // Required property
  title: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
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

export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  duration: string;
  links: string;
  time: string;
}

export interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  isCustom: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}