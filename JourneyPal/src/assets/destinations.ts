export interface Destination {
    id: number;
    image: string;
    alt: string;
    title: string;
    description: string;
  }
  
  export const destinations: Destination[] = [
    {
      id: 1,
      image: "/images/faroe-islands.jpg",
      alt: "Faroe Islands",
      title: "Faroe Islands",
      description: "Dramatic Cliffs • Nordic Villages • Múlafossur Waterfall"
    },
    {
      id: 2,
      image: "/images/tokyo.jpeg",
      alt: "Tokyo",
      title: "Tokyo",
      description: "Tokyo Tower • Senso-ji Temple • Shibuya Crossing"
    },
    {
      id: 3,
      image: "/images/plitvice-lakes.jpg",
      alt: "Plitvice Lakes",
      title: "Plitvice Lakes",
      description: "Waterfalls • Natural Lakes • Ancient Forests"
    },
    {
      id: 4,
      image: "/images/santorini.jpg",
      alt: "Santorini",
      title: "Santorini",
      description: "White Villages • Aegean Sea • Sunset Views"
    },
    {
      "id": 5,
      "image": "/images/egypt.jpg",
      "alt": "Egypt",
      "title": "The Great Pyramids",
      "description": "Desert • Ancient Ruins • Temples and Pyramids"
    },
    {
      id: 6,
      image: "/images/cappadocia.jpg",
      alt: "Cappadocia",
      title: "Cappadocia",
      description: "Hot Air Balloons • Cave Hotels • Rock Churches"
    },
    {
      id: 7,
      image: "/images/machu-picchu.jpg",
      alt: "Machu Picchu",
      title: "Machu Picchu",
      description: "Inca Ruins • Andes Mountains • Sacred Valley"
    }
  ];