export interface UserProfile {
  id: string;
  preferredName: string;
  email: string;
  genderIdentity: string;
  ageGroup: string;
  language: string;
  livingSetting: "Urban" | "Semi-urban" | "Rural";
  placeName?: string;
  coordinates?: { lat: number; lng: number };
  primaryHealthConditions?: string[];
  healthCondition?: string;
  accessibilityPrefs: {
    largeText: boolean;
    screenReader: boolean;
    voiceAssistance: boolean;
    highContrast: boolean;
  };
  consents: {
    encryptedHealthVault: boolean;
    shareClinicalSummaryWithDoctor: boolean;
    lowBandwidthSync: boolean;
    anonymizedResearchOptOut: boolean;
  };
  createdAt: string;
}

export interface SymptomEntry {
  id: string;
  category: string;
  symptoms: string[];
  severity: number;
  durationPattern: string;
  notes?: string;
  triageLevel?: string;
  matchedRule?: string;
  immediateAction?: string;
  loggedAt: string;
}

export interface MoodEntry {
  id: string;
  mood: string;
  phrase: string;
  cycleDay?: number;
  cyclePhase?: string;
  loggedAt: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: "PHC" | "Clinic" | "InclusiveCare" | "Hospital" | "Pharmacy";
  address: string;
  coordinates: { lat: number; lng: number };
  distanceKm: number;
  isGovtVerified: boolean;
  consultationFee: number | null;
  feeDisplay: string;
  openHours: string;
  services: string[];
  accessibility: {
    wheelchairRamp: boolean;
    accessibleToilet: boolean;
    stepFreeGroundFloor: boolean;
    traumaInformedStaff: boolean;
  };
  languagesSpoken: string[];
  femaleDoctorAvailable: boolean;
  transportPartner?: {
    available: boolean;
    type: string;
    description: string;
  };
  contactNumber: string;
  communityAuditedDaysAgo: number;
}

export interface DoctorSpecialist {
  id: string;
  name: string;
  degrees: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  feeInr: number;
  isRuralGrantSubsidized: boolean;
  languages: string[];
  nextAvailableSlot: string;
  avatarUrl: string;
  verified: boolean;
  bio: string;
}

export interface ConsultationBooking {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentTime: string;
  feeInr: number;
  isSubsidized: boolean;
  status: "CONFIRMED" | "WAITING_ROOM" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";
  preConsultChecklist: {
    shareSymptomSummary: boolean;
    audioVideoTested: boolean;
    lowBandwidthMode: boolean;
  };
  doctorAvatarUrl: string;
  createdAt: string;
}

export interface TriageResult {
  isEmergency: boolean;
  level: "EMERGENCY_RED_FLAG" | "URGENT_DOCTOR" | "ROUTINE_CARE" | "SELF_CARE_OBSERVE";
  matchedRule?: string;
  urgentNotice?: string;
  immediateAction: string;
  emergencyHelplines: Array<{
    name: string;
    number: string;
    purpose: string;
  }>;
  clinicalDisclaimer: string;
}

export interface CareKit {
  id: string;
  name: string;
  category: "Menstrual & Hygiene" | "Maternal & Antenatal" | "Nutrition & Anemia" | "Postpartum Comfort";
  contents: string[];
  priceDisplay: string;
  availableAtPHC: string;
  stockCount: number;
  stockStatus: string;
  isSubsidized: boolean;
  deliveryByWomanDriver: boolean;
}

export interface WomanDriver {
  id: string;
  name: string;
  vehicleType: string;
  vehicleNumber: string;
  phone: string;
  hubArea: string;
  rating: number;
  tripsCompleted: number;
  currentLocation: string;
  etaMinutes: number;
  verified: boolean;
  avatarUrl: string;
}

export interface DriverBooking {
  id: string;
  userId?: string;
  driverId: string;
  driverName: string;
  vehicleType: string;
  pickupLocation: string;
  destinationPHC: string;
  etaMinutes: number;
  fareDisplay: string;
  status: "EN_ROUTE" | "ARRIVED" | "COMPLETED";
  createdAt: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  triggerType: "PHONE_DROP_MOTION" | "MANUAL_SOS_TAP" | "VOICE_CONFIRMATION";
  speechTranscript?: string;
  detectedDanger: boolean;
  coordinates: { lat: number; lng: number };
  address: string;
  dispatchedToPoliceStation: {
    name: string;
    phone: string;
    distanceKm: number;
    stationCode: string;
  };
  emergencyContactsNotified: string[];
  status: "ACTIVE_DISPATCH" | "RESOLVED_SAFE" | "STANDBY";
  timestamp: string;
}

export interface Reminder {
  id: string;
  userId?: string;
  title: string;
  category: "Medicine" | "Menstrual Cycle" | "Doctor Follow-up" | "Care Kit Refill";
  frequency: "Daily" | "Monthly" | "Once";
  time: string;
  date: string;
  notes: string;
  completed: boolean;
  createdAt: string;
}
