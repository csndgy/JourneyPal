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
  }
  
  export interface TripPlan {
    startDate: string;
    endDate: string;
    days: TripDay[];
  }