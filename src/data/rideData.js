import shuttleImage from "../assets/grabair-shuttle.png";
import compactImage from "../assets/grabair-compact.png";
import shuttleCity from "../assets/shuttle-city.png";
import compactCity from "../assets/compact-city.png";
import carImage from "../assets/grabair-car.png";
import carCity from "../assets/car-city.png";

import shuttleSeatPlan from "../assets/seating-plan.png";
import compactSeatPlan from "../assets/compact-seating-plan.png";

export const rides = [
  {
    id: "shuttle",
    name: "Ai.R Shuttle",
    category: "Autonomous Shared Shuttle",

    // Vehicle images
    image: shuttleImage,
    detailImage: shuttleCity,

    // Passenger information
    description:
      "Designed for shared journeys, it offers a comfortable, accessible, and convenient travel experience.",

    features: [
      {
        id: "boarding",
        label: "Step-free boarding",
        icon: "footprints",
      },
      {
        id: "cabin",
        label: "Spacious cabin",
        icon: "door",
      },
      {
        id: "accessibility",
        label: "Wheelchair accessible",
        icon: "accessibility",
      },
      {
        id: "capacity",
        label: "Seats up to 8 passengers",
        icon: "users",
      },
    ],

    rideDescription: "Step-free entry",
    space: "Spacious cabin",
    walk: "2 min after",
    wait: "6 min",
    fare: "$3.50",
    sharedFare: 3.50,
    privateFare: 16.00,

    // Seating configuration
    seating: {
      layoutImage: shuttleSeatPlan,
      seats: [
        { id: "A1", x: 30, y: 24, type: "standard" },
        { id: "B1", x: 69, y: 24, type: "standard" },
        { id: "A2", x: 30, y: 38, type: "standard" },
        { id: "B2", x: 69, y: 38, type: "standard" },
        { id: "A3", x: 30, y: 51, type: "standard" },
        { id: "B3", x: 69, y: 51, type: "standard" },
        { id: "A4", x: 30, y: 83, type: "standard" },
        { id: "Priority", x: 69, y: 83, type: "priority" },
      ],
      unavailableSeats: ["A2", "B3"],
    },

    recommended: true,
    requireSeatSelection: true,

    supportedNeeds: [
      "wheelchair",
      "step-free",
      "accessible",
      "priority-seating",
      "extra-space",
    ],
  },

  {
    id: "compact",
    name: "Ai.R Compact",
    category: "Autonomous Private Ride",

    // Vehicle images
    image: compactImage,
    detailImage: compactCity,

    // Passenger information
    description:
      "Travel comfortably with our fully autonomous compact vehicle. Designed for individual travellers and small groups, it provides a convenient and efficient journey.",

    features: [
      {
        id: "boarding",
        label: "Single-step boarding",
        icon: "footprints",
      },
      {
        id: "cabin",
        label: "Compact and cosy cabin",
        icon: "door",
      },
      {
        id: "seating",
        label: "Comfortable passenger seating",
        icon: "armchair",
      },
      {
        id: "journey",
        label: "Ideal for everyday journeys",
        icon: "car",
      },
    ],

    rideDescription: "1 step-up",
    space: "Compact cabin",
    walk: "4 min after",
    wait: "3 min",
    fare: "$5.20",
    sharedFare: 5.20,
    privateFare: 8.00,

    // Seating configuration
    seating: {
      layoutImage: compactSeatPlan,
      seats: [
        { id: "A1", x: 35, y: 32, type: "standard" },
        { id: "B1", x: 68, y: 32, type: "standard" },
        { id: "A2", x: 35, y: 47, type: "standard" },
        { id: "B2", x: 68, y: 47, type: "standard" },
        { id: "Priority", x: 68, y: 69, type: "priority" },
      ],
      unavailableSeats: [],
    },
    recommended: false,
      requireSeatSelection: true,

    supportedNeeds: [
      "standard",
      "comfortable-seating",
    ],
  },
  {
  id: "regular",
  name: "Regular Car",
  category: "Standard Private Ride",

  // Vehicle images
  image: carImage,
  detailImage: carCity,

  // Passenger information
  description:
    "Designed for private travel, it offers a comfortable, driverless ride directly to your destination.",
  
  features: [
    {
      id: "driver",
      label: "Private travel",
      icon: "user-round",
    },
    {
      id: "cabin",
      label: "Comfortable private cabin",
      icon: "car",
    },
    {
      id: "seating",
      label: "Seats up to 4 passengers",
      icon: "users",
    },
    {
      id: "journey",
      label: "Direct point-to-point journey",
      icon: "route",
    },
  ],

  rideDescription: "Private Travel",
  space: "Standard cabin",
  walk: "1 min after",
  wait: "4 min",
  fare: "$8.50",
  privateFare: 8.50,

  // Seating configuration
  seating: null,
  requireSeatSelection: false,

  recommended: false,

  supportedNeeds: [
    "standard",
    "comfortable-seating",
    "private-ride",
    "human-driver",
  ],
}
];

export const getRideById = (rideId) =>
  rides.find((ride) => ride.id === rideId);

export const getRideFare = (rideId, isSharing = true) => {
  const ride = getRideById(rideId);

  if (!ride) return 0;

  if (rideId === "regular") {
    return ride.privateFare;
  }

  return isSharing
    ? ride.sharedFare
    : ride.privateFare;
};

export const formatFare = (amount) =>
  `$${amount.toFixed(2)}`;