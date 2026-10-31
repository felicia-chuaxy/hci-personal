import shuttleImage from "../assets/grabair-shuttle.png";
import compactImage from "../assets/grabair-compact.png";
import carImage from "../assets/grabair-car.png";
import carCity from "../assets/car-city.png";
import shuttleCity from "../assets/shuttle-city.png";
import comapactCity from "../assets/compact-city.png";


export const rides = [
  {
    id: "shuttle",
    name: "Ai.R Shuttle",
    image: shuttleImage,
    detailImage: shuttleCity,
    description: "Designed for a comfortable and accessible ride.",
    features: [
      "Step-free entry",
      "Roomy cabin",
      "Wheelchair friendly",
      "Up to 8 passengers",
    ],
    rideDescription: "Step-free entry",
    space: "Roomy cabin",
    walk: "2 min after",
    wait: "6 min",
    fare: "$3.50",
  },
  {
    id: "compact",
    name: "Ai.R Compact",
    image: compactImage,
    detailImage: comapactCity,
    description: "A compact and convenient ride for your journey.",
    features: [
      "1 step-up",
      "Compact cabin",
      "Comfortable seating",
    ],
    rideDescription: "1 step-up",
    walk: "4 min after",
    wait: "3 min",
    fare: "$5.20",
  },
  {
    id: "regular",
    name: "Regular Ride",
    image: carImage,
    detailImage: carCity,
    description: "A standard car or taxi for your journey.",
    features: [
      "Car or taxi",
      "Standard entry",
      "Comfortable seating",
    ],
    rideDescription: "Car or taxi",
    wait: "4 min",
    fare: "$8.00",
  },
];