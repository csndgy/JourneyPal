export interface Destination {
    id: number;
    image: string;
    alt: string;
    title: string;
    description: string;
  }
  
  export interface TripDay {
    date: string;
    activities: string[];
    images: File[];
    notes: string[];
    events: Event[];
  }
  
  export interface TripPlan {
    startDate: string;
    endDate: string;
    days: TripDay[];
  }

  export interface Event{
    name: string;
    description: string;
    location: string;
    duration: string;
    links: string;
    time: string;
  }