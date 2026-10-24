import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface UserProfile {
  id: string;
  preferredName: string;
  email: string;
  passwordHash?: string;
  genderIdentity: string; // Woman, Transgender woman, Non-binary / Self-described, Prefer not to say
  ageGroup: string; // 18–24, 25–34, 35–44, 45+
  language: string; // English, हिन्दी, தமிழ், മലയാളം, ಕನ್ನಡ, తెలుగు
  livingSetting: "Urban" | "Semi-urban" | "Rural";
  placeName?: string;
  coordinates?: { lat: number; lng: number };
  primaryHealthConditions?: string[];
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
  userId: string;
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
  userId: string;
  mood: string;
  phrase: string;
  cycleDay?: number;
  cyclePhase?: string;
  loggedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  prompt: string;
  encryptedContent: string;
  isEncrypted: boolean;
  createdAt: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: "PHC" | "Clinic" | "InclusiveCare" | "Hospital" | "Pharmacy";
  address: string;
  coordinates: { lat: number; lng: number };
  distanceKm: number;
  isGovtVerified: boolean;
  consultationFee: number | null; // null = free / Ayushman
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
  userId: string;
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
  userId: string;
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
  userId: string;
  title: string;
  category: "Medicine" | "Menstrual Cycle" | "Doctor Follow-up" | "Care Kit Refill";
  frequency: "Daily" | "Monthly" | "Once";
  time: string;
  date: string;
  notes: string;
  completed: boolean;
  createdAt: string;
}

// In-Memory storage backed with JSON write-through for persistence
class Database {
  private users: Map<string, UserProfile> = new Map();
  private sessions: Map<string, string> = new Map(); // token -> userId
  private symptoms: Map<string, SymptomEntry[]> = new Map(); // userId -> entries
  private moods: Map<string, MoodEntry[]> = new Map(); // userId -> entries
  private journals: Map<string, JournalEntry[]> = new Map(); // userId -> entries
  private bookings: Map<string, ConsultationBooking[]> = new Map(); // userId -> bookings
  private facilities: HealthcareFacility[] = [];
  private doctors: DoctorSpecialist[] = [];
  private careKits: CareKit[] = [];
  private womenDrivers: WomanDriver[] = [];
  private driverBookings: Map<string, DriverBooking[]> = new Map();
  private sosAlerts: SOSAlert[] = [];
  private reminders: Map<string, Reminder[]> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Default Demo User (Ananya)
    const demoUser: UserProfile = {
      id: "usr_demo_ananya",
      preferredName: "Ananya",
      email: "ananya@hersakhi.org",
      genderIdentity: "Woman",
      ageGroup: "25–34",
      language: "English",
      livingSetting: "Semi-urban",
      placeName: "Mayur Vihar Ph-1, Delhi",
      coordinates: { lat: 28.6083, lng: 77.2954 },
      primaryHealthConditions: ["Irregular Menstruation / PCOS", "Pelvic Cramps"],
      accessibilityPrefs: {
        largeText: false,
        screenReader: false,
        voiceAssistance: true,
        highContrast: false,
      },
      consents: {
        encryptedHealthVault: true,
        shareClinicalSummaryWithDoctor: true,
        lowBandwidthSync: true,
        anonymizedResearchOptOut: true,
      },
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    };
    this.users.set(demoUser.id, demoUser);
    this.sessions.set("demo-session-token", demoUser.id);

    // Initial Symptoms for Ananya
    this.symptoms.set(demoUser.id, [
      {
        id: "sym_1",
        userId: demoUser.id,
        category: "menstrual",
        symptoms: ["Sharp lower abdomen ache", "Mood changes", "Moderate cramps"],
        severity: 3,
        durationPattern: "Started 2 days ago",
        notes: "Hot compress applied, pain localized to pelvic region.",
        triageLevel: "ROUTINE_CARE",
        immediateAction: "Rest, monitor cyclic changes, log daily variations.",
        loggedAt: "2024-10-12T09:30:00Z",
      },
      {
        id: "sym_2",
        userId: demoUser.id,
        category: "hormonal",
        symptoms: ["Spotting", "Irregular cycle"],
        severity: 2,
        durationPattern: "Recurring each cycle",
        notes: "Irregular 38-day cycle noted, PCOS tracker sync.",
        triageLevel: "SELF_CARE_OBSERVE",
        immediateAction: "Maintain menstrual calendar, consult gynaecologist if cycle extends >45 days.",
        loggedAt: "2024-09-28T19:15:00Z",
      },
      {
        id: "sym_3",
        userId: demoUser.id,
        category: "menstrual",
        symptoms: ["Mild pelvic tension"],
        severity: 2,
        durationPattern: "Ovulation window",
        notes: "Self-resolved within 12 hours without medication.",
        triageLevel: "SELF_CARE_OBSERVE",
        immediateAction: "Healthy hydration and gentle stretches.",
        loggedAt: "2024-09-14T16:00:00Z",
      },
    ]);

    // Initial Moods
    this.moods.set(demoUser.id, [
      { id: "m_1", userId: demoUser.id, mood: "Balanced", phrase: "Balanced & Centered", cycleDay: 14, cyclePhase: "Ovulation window", loggedAt: new Date().toISOString() },
      { id: "m_2", userId: demoUser.id, mood: "Peaceful", phrase: "Peaceful & Grounded", cycleDay: 13, cyclePhase: "Follicular", loggedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "m_3", userId: demoUser.id, mood: "Fatigued", phrase: "Low Energy & Resting", cycleDay: 12, cyclePhase: "Follicular", loggedAt: new Date(Date.now() - 172800000).toISOString() },
    ]);

    // Initial Active Consultation Booking
    this.bookings.set(demoUser.id, [
      {
        id: "SH-4821",
        userId: demoUser.id,
        doctorId: "doc_1",
        doctorName: "Dr. Fatima Sheikh",
        specialty: "Senior Gynaecologist & Obstetrician",
        appointmentTime: "Tomorrow at 4:30 PM (IST)",
        feeInr: 250,
        isSubsidized: true,
        status: "CONFIRMED",
        preConsultChecklist: {
          shareSymptomSummary: true,
          audioVideoTested: true,
          lowBandwidthMode: true,
        },
        doctorAvatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFlnJPILxUNJmOtj5QYWGQ8cVmJIhKihGHMznQU4k0itymJIvMNVfV_uF8tpu4jFcGbV8if-mp22YLVDKPzSieTQb3xf8vq6GNeoQcqktHnkrc6n4VBD6N9BayUDfyeq9MSsDmuYqsM1wFT_EbLskmjIJHPAJgXI7xnFxAQrudZ91eY44n7NhBDbRIj7si0KVpjv1sQqctfE7PnyEQZl5SpRz53S8fBZw4Vd9UmWYbXB9855WgBu_W",
        createdAt: new Date().toISOString(),
      },
    ]);

    // Seed Verified Facilities
    this.facilities = [
      {
        id: "fac_1",
        name: "Kalyani Community Health Centre (PHC)",
        type: "PHC",
        address: "Pocket 1, Near Mayur Vihar Metro Station, New Delhi",
        coordinates: { lat: 28.6083, lng: 77.2954 },
        distanceKm: 1.8,
        isGovtVerified: true,
        consultationFee: 0,
        feeDisplay: "Free / Ayushman Card",
        openHours: "Open till 6:00 PM (Mon-Sat)",
        services: [
          "General Gynaecology consultation",
          "Routine Antenatal screening (ANC)",
          "Free Iron & Calcium tablets dispensary",
          "Adolescent wellness desk",
          "Immunization & Child Health",
        ],
        accessibility: {
          wheelchairRamp: true,
          accessibleToilet: true,
          stepFreeGroundFloor: true,
          traumaInformedStaff: true,
        },
        languagesSpoken: ["Hindi", "English"],
        femaleDoctorAvailable: true,
        contactNumber: "1075",
        communityAuditedDaysAgo: 2,
      },
      {
        id: "fac_2",
        name: "Dr. Sunita Rao Women's Care Clinic",
        type: "Clinic",
        address: "B-42, Shashi Garden, Patparganj Road, Delhi",
        coordinates: { lat: 28.6142, lng: 77.3021 },
        distanceKm: 3.2,
        isGovtVerified: true,
        consultationFee: 300,
        feeDisplay: "₹300",
        openHours: "9:00 AM - 8:00 PM",
        services: [
          "MD Gynaecology & Obstetrics",
          "On-Site Pelvic Ultrasound (USG)",
          "PCOS / PCOD Lab Tests & Hormone Profiling",
          "Menopausal & Fertility Counseling",
        ],
        accessibility: {
          wheelchairRamp: true,
          accessibleToilet: true,
          stepFreeGroundFloor: true,
          traumaInformedStaff: true,
        },
        languagesSpoken: ["Hindi", "English", "Bhojpuri"],
        femaleDoctorAvailable: true,
        transportPartner: {
          available: true,
          type: "Women-Driven E-Rickshaw Partner",
          description: "Verified woman driver doorstep pickup available via clinic desk.",
        },
        contactNumber: "+91 98765 43210",
        communityAuditedDaysAgo: 2,
      },
      {
        id: "fac_3",
        name: "Maitri Inclusive Health & Trans-friendly Care",
        type: "InclusiveCare",
        address: "7th Avenue, Near Defence Colony / Lajpat Nagar, Delhi",
        coordinates: { lat: 28.5729, lng: 77.2341 },
        distanceKm: 5.1,
        isGovtVerified: true,
        consultationFee: 400,
        feeDisplay: "₹400",
        openHours: "10:00 AM - 7:00 PM (Slotted appointments)",
        services: [
          "Sensitized gynaecological care for trans & non-binary persons",
          "Gender-affirming hormone therapy guidance (GAHT)",
          "Confidential reproductive & STI testing",
          "Trauma-informed mental wellness counsel",
          "Strict zero-deadnaming protocol",
        ],
        accessibility: {
          wheelchairRamp: true,
          accessibleToilet: true,
          stepFreeGroundFloor: true,
          traumaInformedStaff: true,
        },
        languagesSpoken: ["Hindi", "English", "Punjabi", "Urdu"],
        femaleDoctorAvailable: true,
        contactNumber: "+91 99887 76655",
        communityAuditedDaysAgo: 2,
      },
      {
        id: "fac_4",
        name: "Jan Aushadhi Kendra & Reproductive Dispensary",
        type: "Pharmacy",
        address: "Shop 12, DDA Community Market, Mayur Vihar Phase 1",
        coordinates: { lat: 28.6045, lng: 77.2912 },
        distanceKm: 1.2,
        isGovtVerified: true,
        consultationFee: 0,
        feeDisplay: "Subsidized Generic Medicines (Up to 80% discount)",
        openHours: "8:30 AM - 9:30 PM (All 7 days)",
        services: [
          "Subsidized biodegradable sanitary pads (₹1/pad Pradhan Mantri Suvidha)",
          "Generic oral contraceptives & emergency pills",
          "Iron & Folic Acid supplements",
          "Pregnancy testing kits",
        ],
        accessibility: {
          wheelchairRamp: true,
          accessibleToilet: false,
          stepFreeGroundFloor: true,
          traumaInformedStaff: true,
        },
        languagesSpoken: ["Hindi", "English"],
        femaleDoctorAvailable: false,
        contactNumber: "+91 1800 180 8080",
        communityAuditedDaysAgo: 3,
      },
    ];

    // Seed Verified Specialist Doctors
    this.doctors = [
      {
        id: "doc_1",
        name: "Dr. Fatima Sheikh",
        degrees: "MBBS, MS - Obstetrics & Gynaecology",
        specialty: "Senior Gynaecologist & Obstetrician",
        experienceYears: 12,
        rating: 4.9,
        reviewCount: 420,
        feeInr: 250,
        isRuralGrantSubsidized: true,
        languages: ["English", "Hindi", "Urdu"],
        nextAvailableSlot: "Today at 5:00 PM",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk76Z3yl9FJaliuuhQpUoU22eqcMIumk007RWFPmHwhlR_cLh11Fe0tRzF13ZeF2MxcTppf2kXfa3Q3tdwigJWkx6mHVocYPzDJytXoNAnGiZFvGP19RiGrFwIEKLug64tQRq72lCGMTaEiiIkMUwHepNjVP9zBbo4N1zFQ5mruXXzduBWxSGB8e3ZExcrwHrPBhXFsS3ZPQzbc7ZF17dh8D5pELStcu8Ql_Usz5cpjVHFMPZMaWe_",
        verified: true,
        bio: "Compassionate reproductive specialist with extensive experience in pelvic disorders, high-risk pregnancies, and adolescent reproductive health.",
      },
      {
        id: "doc_2",
        name: "Dr. Kavitha Sundaram",
        degrees: "MD - Reproductive Medicine & Endocrine Disorders",
        specialty: "PCOS & Hormonal Care Specialist",
        experienceYears: 9,
        rating: 4.8,
        reviewCount: 290,
        feeInr: 350,
        isRuralGrantSubsidized: false,
        languages: ["Tamil", "English", "Kannada"],
        nextAvailableSlot: "Tomorrow at 10:30 AM",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpWEMgs-Gzqm9mosya7sP2S_6pZ7YUPA9qhyaA0QKP37plnBJNvD2Cz4JGz6NjYUh7E8aCM0FOS6rCa9jIqS_bsFxN106THccZSoxnsPggJm77E546t0U723PFCNvpBPzBp1ECLvaW4eveihVadCLKtAGY3QSfDtWpWL45d-o5cX3Sil0jFN34G5uGoJv32tffoqktdjtprmHaFOecUUCgw9tVT8szwXid3XFLXFKnf5WXBX8oyxJT",
        verified: true,
        bio: "Evidence-grounded endocrinologist specializing in PCOS reversal, insulin resistance, irregular menstruation, and fertility preservation.",
      },
      {
        id: "doc_3",
        name: "Dr. Aruna Patel",
        degrees: "M.Phil Clinical Psychology, PhD",
        specialty: "Clinical Psychologist & Trauma-Informed Therapist",
        experienceYears: 14,
        rating: 5.0,
        reviewCount: 180,
        feeInr: 400,
        isRuralGrantSubsidized: false,
        languages: ["Hindi", "Gujarati", "English"],
        nextAvailableSlot: "Today at 6:30 PM",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOcqUuWbQXd4ZhgG5b0ILwTK9t7iaudEQzQVAK0dJ4i5wuzVKfZZGuNInKtEE7g_vQCPJlDZ_RJf_A1bdFJ2q6H7Ak3w9WDUYr3KlDuUKhnMNwTomQe2rr6xCEwCJ0AKBW6EI09iAnJ3vWAVEtWNOt4hEWksnnu4ImasCEubSulTODjPSZajTrjqgKervziMZnsLxXV5onN6vtZ1uGfxb_JKnAUUhyiZ45zD4IFY8iJ5Vbz5S7-TIh",
        verified: true,
        bio: "Specializing in women's somatic stress, burnout, postpartum depression, and body image support in a warm, judgment-free space.",
      },
      {
        id: "doc_4",
        name: "Dr. Priya Narang",
        degrees: "M.Phil Clinical Psych",
        specialty: "Queer & Trans-Affirmative Mental Health Specialist",
        experienceYears: 8,
        rating: 4.9,
        reviewCount: 215,
        feeInr: 300,
        isRuralGrantSubsidized: true,
        languages: ["Hindi", "English"],
        nextAvailableSlot: "Today at 4:30 PM",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2asQd3frggO8dNnO9mDnpGg3lX93qvCEvfLK960yqFBJoJEJNKZA8SxG2NTbNmTI4OuO2vWT1eOMLHT2x-P85WB6KMptMU_gbsSRiQJ9qBo2HALDdtQBvD7WUmRFJueDKfHh_-OQuRV1OS9uRqGer6YXXkm9GuECRZvZ82DheoHuIF1CC8Qm8m83Nx1Q9MDeW9lf2jHgQbiL3xvwLbA7wB7IgekJAStp7ulLw28V2vUY8Vju7NeXM",
        verified: true,
        bio: "Certified affirmative counselor focusing on gender dysphoria, anxiety, relational distress, and self-compassion.",
      },
      {
        id: "doc_5",
        name: "Shalini Sen, MSW",
        degrees: "MSW, Somatic Trauma Practitioner",
        specialty: "Somatic Trauma & Postpartum Specialist",
        experienceYears: 7,
        rating: 4.9,
        reviewCount: 160,
        feeInr: 250,
        isRuralGrantSubsidized: true,
        languages: ["Bengali", "Hindi", "English"],
        nextAvailableSlot: "Tomorrow at 11:00 AM",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2OViw3UhuvSvZ8f38OY8wBzowNDuUl-NSGotvKMJ-9GSj6f7cyZl48m4o_LBxKb1BM25peVSgUascDOHkEzZDo-Zl4A9Gd0VYh-ANio1gLQQqG-JtfwlNAM4OAYis9RKEFbfkbUXKxASBDzniIHTGdEA6o62B4q6yrTpMLnif69xtNFLLLIthNVXCLNpjkvnaDc5IXDrU2yQYGZuPYS4MYcaj6L9eBw-6ZQtj9cDGQkV1FHfSiJBR",
        verified: true,
        bio: "Embodied nervous system regulator and community birth doula offering compassionate maternal mental wellness care.",
      },
    ];

    // Seed Rural Care Kits
    this.careKits = [
      {
        id: "kit_1",
        name: "Suvidha Menstrual & Dignity Kit",
        category: "Menstrual & Hygiene",
        contents: [
          "10x Biodegradable Oxo-degradable Sanitary Pads (PM-Suvidha)",
          "1x Reusable Herbal Heating Gel Pack for Cramps",
          "1x Antiseptic Neem & Tulsi Intimate Wash",
          "1x Menstrual Cycle Tracking Dial & Educational Guide",
          "Disposal paper bags",
        ],
        priceDisplay: "Free at PHC / ₹25 doorstep",
        availableAtPHC: "Kalyani Community Health Centre",
        stockCount: 42,
        stockStatus: "Ready in Stock (42 kits)",
        isSubsidized: true,
        deliveryByWomanDriver: true,
      },
      {
        id: "kit_2",
        name: "Pradhan Mantri Matru Suraksha Kit",
        category: "Maternal & Antenatal",
        contents: [
          "Clean Delivery Kit (Sterile blade, cord tie, plastic sheet, soap)",
          "60x Iron & Folic Acid (IFA) Red Tablets",
          "30x Calcium & Vitamin D3 Tablets",
          "Digital Thermometer & Danger Sign Flashcards in Hindi/Regional",
          "Emergency Ambulance Call Token (102/108)",
        ],
        priceDisplay: "100% Free under Janani Suraksha Yojana",
        availableAtPHC: "Mayur Vihar Sub-Centre / Anganwadi",
        stockCount: 18,
        stockStatus: "In Stock (18 kits)",
        isSubsidized: true,
        deliveryByWomanDriver: true,
      },
      {
        id: "kit_3",
        name: "Anemia Mukt Poshan Kit",
        category: "Nutrition & Anemia",
        contents: [
          "Blue Iron-Folic Acid Tablets for Adolescents & Women",
          "Nutritious Jaggery & Roasted Gram (Chana-Gud) Energy Bars",
          "Hemoglobin Color Scale & Testing Voucher",
          "Diet chart of locally grown green leafy vegetables (Palak, Methi, Moringa)",
        ],
        priceDisplay: "Free at Anganwadi",
        availableAtPHC: "Kalyani Community Health Centre",
        stockCount: 30,
        stockStatus: "In Stock (30 kits)",
        isSubsidized: true,
        deliveryByWomanDriver: true,
      },
      {
        id: "kit_4",
        name: "Postpartum Recovery & Lactation Kit",
        category: "Postpartum Comfort",
        contents: [
          "Maternity Absorbent Pads (Pack of 12)",
          "Shatavari & Fenugreek Lactation Granules",
          "Sitz Bath Salts with Calendula for Perineal Healing",
          "Infant Kangaroo Mother Care Binder",
        ],
        priceDisplay: "Subsidized ₹99",
        availableAtPHC: "Patparganj MCH Center",
        stockCount: 12,
        stockStatus: "In Stock (12 kits)",
        isSubsidized: true,
        deliveryByWomanDriver: true,
      },
    ];

    // Seed Verified Women Drivers (Saheli Vahan Collective)
    this.womenDrivers = [
      {
        id: "drv_1",
        name: "Sunita Devi",
        vehicleType: "Electric Rickshaw (Pink Saheli)",
        vehicleNumber: "DL-1ER-4492",
        phone: "+91 98112 34567",
        hubArea: "Mayur Vihar Phase 1 & Metro Junction",
        rating: 4.9,
        tripsCompleted: 840,
        currentLocation: "Near Kalyani PHC Gate 2",
        etaMinutes: 4,
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "drv_2",
        name: "Rehana Bano",
        vehicleType: "Solar Electric Auto",
        vehicleNumber: "DL-2EA-8819",
        phone: "+91 98765 11223",
        hubArea: "Patparganj Rural Belt & Shashi Garden",
        rating: 4.8,
        tripsCompleted: 610,
        currentLocation: "Patparganj Mother & Child Wing",
        etaMinutes: 7,
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "drv_3",
        name: "Kavitha Murugan",
        vehicleType: "Community Patient Transit Van",
        vehicleNumber: "DL-3PV-2024",
        phone: "+91 99100 88221",
        hubArea: "East Delhi PHC Cluster",
        rating: 5.0,
        tripsCompleted: 1120,
        currentLocation: "Trilokpuri Sector 15",
        etaMinutes: 11,
        verified: true,
        avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80",
      },
    ];

    // Seed Follow-up Reminders for Demo User
    this.reminders.set(demoUser.id, [
      {
        id: "rem_1",
        userId: demoUser.id,
        title: "Iron & Folic Acid Tablet",
        category: "Medicine",
        frequency: "Daily",
        time: "08:30 PM",
        date: "Today",
        notes: "Take with water after dinner. Avoid drinking hot tea right after.",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "rem_2",
        userId: demoUser.id,
        title: "Post-Pelvic Cramp Recovery Follow-up",
        category: "Doctor Follow-up",
        frequency: "Once",
        time: "04:30 PM",
        date: "Tomorrow",
        notes: "Teleconsultation with Dr. Fatima Sheikh regarding sharp lower abdominal discomfort.",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "rem_3",
        userId: demoUser.id,
        title: "Expected Period Window Window Alert",
        category: "Menstrual Cycle",
        frequency: "Monthly",
        time: "09:00 AM",
        date: "01 Nov 2024",
        notes: "Cycle Day 28 approaching. Keep Suvidha Care Kit handy.",
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // --- Auth & Profile Methods ---
  public getUserById(id: string): UserProfile | undefined {
    return this.users.get(id);
  }

  public getUserByToken(token: string): UserProfile | undefined {
    const userId = this.sessions.get(token);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  public createUser(profile: Omit<UserProfile, "id" | "createdAt">): { user: UserProfile; token: string } {
    const id = "usr_" + crypto.randomUUID().slice(0, 8);
    const user: UserProfile = {
      ...profile,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    const token = "tok_" + crypto.randomBytes(24).toString("hex");
    this.sessions.set(token, id);
    return { user, token };
  }

  public createSession(userId: string): string {
    const token = "tok_" + crypto.randomBytes(24).toString("hex");
    this.sessions.set(token, userId);
    return token;
  }

  public revokeSession(token: string): void {
    this.sessions.delete(token);
  }

  public updateUserProfile(id: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  public deleteUserAccount(id: string): boolean {
    this.users.delete(id);
    this.symptoms.delete(id);
    this.moods.delete(id);
    this.journals.delete(id);
    this.bookings.delete(id);
    this.driverBookings.delete(id);
    this.reminders.delete(id);
    for (const [tok, uid] of this.sessions.entries()) {
      if (uid === id) this.sessions.delete(tok);
    }
    return true;
  }

  // --- Symptoms Methods ---
  public getSymptoms(userId: string): SymptomEntry[] {
    return this.symptoms.get(userId) || [];
  }

  public addSymptom(userId: string, entry: Omit<SymptomEntry, "id" | "userId" | "loggedAt">): SymptomEntry {
    const list = this.symptoms.get(userId) || [];
    const newEntry: SymptomEntry = {
      ...entry,
      id: "sym_" + crypto.randomUUID().slice(0, 8),
      userId,
      loggedAt: new Date().toISOString(),
    };
    list.unshift(newEntry);
    this.symptoms.set(userId, list);
    return newEntry;
  }

  // --- Mood Methods ---
  public getMoods(userId: string): MoodEntry[] {
    return this.moods.get(userId) || [];
  }

  public addMood(userId: string, entry: Omit<MoodEntry, "id" | "userId" | "loggedAt">): MoodEntry {
    const list = this.moods.get(userId) || [];
    const newEntry: MoodEntry = {
      ...entry,
      id: "m_" + crypto.randomUUID().slice(0, 8),
      userId,
      loggedAt: new Date().toISOString(),
    };
    list.unshift(newEntry);
    this.moods.set(userId, list);
    return newEntry;
  }

  // --- Journal Methods ---
  public getJournals(userId: string): JournalEntry[] {
    return this.journals.get(userId) || [];
  }

  public addJournal(userId: string, entry: Omit<JournalEntry, "id" | "userId" | "createdAt">): JournalEntry {
    const list = this.journals.get(userId) || [];
    const newEntry: JournalEntry = {
      ...entry,
      id: "jrn_" + crypto.randomUUID().slice(0, 8),
      userId,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newEntry);
    this.journals.set(userId, list);
    return newEntry;
  }

  // --- Facilities & Healthcare Discovery ---
  public getFacilities(query?: string, filter?: string): HealthcareFacility[] {
    let result = [...this.facilities];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.services.some((s) => s.toLowerCase().includes(q)) ||
          f.address.toLowerCase().includes(q)
      );
    }
    if (filter === "ayushman") {
      result = result.filter((f) => f.consultationFee === 0 || f.type === "PHC");
    } else if (filter === "wheelchair") {
      result = result.filter((f) => f.accessibility.wheelchairRamp);
    } else if (filter === "female_doctor") {
      result = result.filter((f) => f.femaleDoctorAvailable);
    } else if (filter === "transport") {
      result = result.filter((f) => Boolean(f.transportPartner?.available));
    }
    return result;
  }

  public getFacilityById(id: string): HealthcareFacility | undefined {
    return this.facilities.find((f) => f.id === id);
  }

  // --- Doctor Specialists & Consultations ---
  public getDoctors(specialty?: string): DoctorSpecialist[] {
    if (!specialty || specialty === "All") return this.doctors;
    return this.doctors.filter(
      (d) =>
        d.specialty.toLowerCase().includes(specialty.toLowerCase()) ||
        d.bio.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  public getDoctorById(id: string): DoctorSpecialist | undefined {
    return this.doctors.find((d) => d.id === id);
  }

  public getBookings(userId: string): ConsultationBooking[] {
    return this.bookings.get(userId) || [];
  }

  public addBooking(
    userId: string,
    bookingData: Omit<ConsultationBooking, "id" | "userId" | "createdAt">
  ): ConsultationBooking {
    const list = this.bookings.get(userId) || [];
    const newBooking: ConsultationBooking = {
      ...bookingData,
      id: "SH-" + Math.floor(1000 + Math.random() * 9000),
      userId,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newBooking);
    this.bookings.set(userId, list);
    return newBooking;
  }

  public updateBooking(
    userId: string,
    bookingId: string,
    updates: Partial<ConsultationBooking>
  ): ConsultationBooking | undefined {
    const list = this.bookings.get(userId) || [];
    const index = list.findIndex((b) => b.id === bookingId);
    if (index === -1) return undefined;
    list[index] = { ...list[index], ...updates };
    this.bookings.set(userId, list);
    return list[index];
  }

  // --- Care Kits Methods ---
  public getCareKits(category?: string): CareKit[] {
    if (!category || category === "All") return this.careKits;
    return this.careKits.filter((k) => k.category === category);
  }

  // --- Women Drivers & Bookings ---
  public getWomenDrivers(): WomanDriver[] {
    return this.womenDrivers;
  }

  public bookWomanDriver(
    userId: string,
    driverId: string,
    pickupLocation: string,
    destinationPHC: string
  ): DriverBooking {
    const driver = this.womenDrivers.find((d) => d.id === driverId) || this.womenDrivers[0];
    const booking: DriverBooking = {
      id: "SAH-" + Math.floor(1000 + Math.random() * 9000),
      userId,
      driverId: driver.id,
      driverName: driver.name,
      vehicleType: driver.vehicleType,
      pickupLocation: pickupLocation || "Current Patient Location",
      destinationPHC: destinationPHC || "Nearest Public Health Centre",
      etaMinutes: driver.etaMinutes,
      fareDisplay: "Free under PM-Matru / Rural Subsidy",
      status: "EN_ROUTE",
      createdAt: new Date().toISOString(),
    };

    const list = this.driverBookings.get(userId) || [];
    list.unshift(booking);
    this.driverBookings.set(userId, list);
    return booking;
  }

  public getDriverBookings(userId: string): DriverBooking[] {
    return this.driverBookings.get(userId) || [];
  }

  // --- SOS & Emergency Alert Methods ---
  public triggerSOS(alertData: Omit<SOSAlert, "id" | "timestamp">): SOSAlert {
    const alert: SOSAlert = {
      ...alertData,
      id: "SOS-" + crypto.randomUUID().slice(0, 8),
      timestamp: new Date().toISOString(),
    };
    this.sosAlerts.unshift(alert);
    return alert;
  }

  public getLatestSOS(userId: string): SOSAlert | undefined {
    return this.sosAlerts.find((a) => a.userId === userId);
  }

  public resolveSOS(alertId: string): boolean {
    const alert = this.sosAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = "RESOLVED_SAFE";
      return true;
    }
    return false;
  }

  // --- Reminders & Follow-ups Methods ---
  public getReminders(userId: string): Reminder[] {
    return this.reminders.get(userId) || [];
  }

  public addReminder(userId: string, data: Omit<Reminder, "id" | "userId" | "createdAt">): Reminder {
    const list = this.reminders.get(userId) || [];
    const reminder: Reminder = {
      ...data,
      id: "rem_" + crypto.randomUUID().slice(0, 8),
      userId,
      createdAt: new Date().toISOString(),
    };
    list.unshift(reminder);
    this.reminders.set(userId, list);
    return reminder;
  }

  public toggleReminder(userId: string, reminderId: string): Reminder | undefined {
    const list = this.reminders.get(userId) || [];
    const item = list.find((r) => r.id === reminderId);
    if (item) {
      item.completed = !item.completed;
      return item;
    }
    return undefined;
  }

  public deleteReminder(userId: string, reminderId: string): boolean {
    const list = this.reminders.get(userId) || [];
    const filtered = list.filter((r) => r.id !== reminderId);
    this.reminders.set(userId, filtered);
    return true;
  }
}

export const db = new Database();
