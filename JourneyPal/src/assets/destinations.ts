export interface JsonDestination {
  id: number;
  image: string;
  alt: string;
  title: string;
  description: string;
}

export interface Destination extends JsonDestination {
  coordinates?: { lat: number; lng: number };
}

export const destinations: Destination[] = [
  {
    id: 1,
    image: "/images/faroe-islands.jpg",
    alt: "Faroe Islands",
    title: "Faroe Islands",
    description: "Kalsoy • Nordic Villages • Kallur Lighthouse • Múlafossur Waterfall",
    coordinates: { lat: 62.007864, lng: -6.790982 } // Faroe Islands koordinátái
  },
  {
    id: 2,
    image: "/images/tokyo.jpeg",
    alt: "Tokyo",
    title: "Tokyo",
    description: "Tokyo Tower • Senso-ji Temple • Shinjuku Gyoen • Kijomizudera",
    coordinates: { lat: 35.6895, lng: 139.6917 } // Tokyo koordinátái
  },
  {
    id: 3,
    image: "/images/plitvice-lakes.jpg",
    alt: "Plitvice Lakes",
    title: "Plitvice Lakes",
    description: "Rastoke watermills • Mrežnica river • Caves of Barac • Plitvice Valley",
    coordinates: { lat: 44.8654, lng: 15.5820 } // Plitvice Lakes koordinátái
  },
  {
    id: 4,
    image: "/images/santorini.jpg",
    alt: "Santorini",
    title: "Santorini",
    description: "White Villages - Oia • Red beach • Ancient Thera • Akrotiri Lighthouse",
    coordinates: { lat: 36.3932, lng: 25.4615 } // Santorini koordinátái
  },
  {
    id: 5,
    image: "/images/egypt.jpg",
    alt: "Egypt",
    title: "The Great Pyramids",
    description: "Great Sphinx of Giza • Khafres pyramid • Saqqara Necropolis • Pharaonic Village",
    coordinates: { lat: 29.9792, lng: 31.1342 } // The Great Pyramids koordinátái
  },
  {
    id: 6,
    image: "/images/cappadocia.jpg",
    alt: "Cappadocia",
    title: "Cappadocia",
    description: "Hot Air Balloons • Cave Hotels • Rock Churches",
    coordinates: { lat: 38.6431, lng: 34.8307 } // Cappadocia koordinátái
  },
  {
    id: 7,
    image: "/images/machu-picchu.jpg",
    alt: "Machu Picchu",
    title: "Machu Picchu",
    description: "Inca Ruins • Andes Mountains • Sacred Valley",
    coordinates: { lat: -13.1631, lng: -72.5450 } // Machu Picchu koordinátái
  }
];