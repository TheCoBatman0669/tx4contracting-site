/**
 * Capability content model.
 *
 * Every capability detail page is rendered from this file by
 * app/capabilities/[slug]/page.tsx. Adding a capability requires no layout
 * work: add an entry here and set `published: true`.
 *
 * IMPORTANT: only set `published: true` for services TX4 has confirmed it
 * actually performs. Unpublished entries are excluded from navigation, cards,
 * and static params, and their URLs return a 404.
 */

export interface CapabilityFeature {
  /** Icon name resolved by components/icon.tsx */
  icon: string;
  title: string;
  description: string;
}

export interface CapabilityAudience {
  label: string;
  description: string;
}

export interface CapabilityProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface CapabilityFaq {
  question: string;
  answer: string;
}

export interface Capability {
  slug: string;
  /** Short label used in cards, navigation, and breadcrumbs */
  title: string;
  /** Longer H1 used on the detail page */
  heroTitle: string;
  /** Card copy and meta description fallback */
  shortDescription: string;
  /** Lead paragraph under the H1 */
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  icon: string;

  /** What TX4 provides */
  overviewHeading: string;
  overview: string[];

  /** How the work is delivered */
  deliveryHeading: string;
  deliveryIntro: string;
  deliveryAreas: CapabilityFeature[];

  /** Where it applies */
  projectTypesHeading: string;
  projectTypesIntro: string;
  projectTypes: string[];

  /** Who benefits */
  audiences: CapabilityAudience[];

  /** How safety and quality are managed */
  safetyQuality: CapabilityFeature[];

  /** How engagement works */
  processSteps: CapabilityProcessStep[];

  /** Answer-first Q&A used on the page and for FAQPage structured data */
  faqs: CapabilityFaq[];

  /** Slugs of related capabilities, for internal linking */
  relatedCapabilities: string[];

  published: boolean;
}

export const capabilities: Capability[] = [
  {
    slug: 'general-construction',
    title: 'General Construction',
    heroTitle: 'Government General Construction',
    shortDescription:
      'Comprehensive project delivery for government facilities and infrastructure\u2014coordinated through one accountable team from mobilization to closeout.',
    heroDescription:
      'TX4 Contracting supports government and public-sector construction requirements through organized, accountable project execution. One team coordinates the trades, schedules, safety, and documentation your project demands.',
    metaTitle: 'General Construction',
    metaDescription:
      'TX4 Contracting provides coordinated general construction for federal, state, county, and municipal projects, plus subcontracting and teaming support for prime contractors.',
    icon: 'Building2',

    overviewHeading: 'Coordinated Project Delivery',
    overview: [
      'Government construction projects involve multiple trades, regulatory requirements, safety standards, and documentation expectations. TX4 Contracting coordinates these elements through a single accountable team, so agencies and prime contractors receive organized execution rather than fragmented vendor management.',
      'Our approach brings together qualified resources, clear scheduling, consistent communication, and thorough documentation to deliver projects safely and to specification.',
    ],

    deliveryHeading: 'Project-Delivery Support',
    deliveryIntro:
      'TX4 coordinates the following areas across the project lifecycle.',
    deliveryAreas: [
      {
        icon: 'ClipboardList',
        title: 'Project Planning & Coordination',
        description:
          'Organizing project requirements, timelines, and resource needs before work begins.',
      },
      {
        icon: 'Calendar',
        title: 'Schedule Coordination',
        description:
          'Managing project timelines and sequencing to keep work on track.',
      },
      {
        icon: 'Users',
        title: 'Trade & Vendor Coordination',
        description:
          'Organizing qualified trades and suppliers for coordinated project delivery.',
      },
      {
        icon: 'HardHat',
        title: 'Field Execution',
        description:
          'Managing on-site operations, logistics, and daily work activities.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Safety Coordination',
        description:
          'Maintaining safety awareness, protocols, and documentation throughout the project.',
      },
      {
        icon: 'FileText',
        title: 'Quality Documentation',
        description:
          'Tracking quality requirements, inspections, and project documentation.',
      },
      {
        icon: 'MessageSquare',
        title: 'Project Communication',
        description:
          'Providing clear, consistent communication to stakeholders at every phase.',
      },
      {
        icon: 'CheckCircle2',
        title: 'Punch-List & Closeout',
        description:
          'Completing final inspections, corrections, and project documentation for turnover.',
      },
    ],

    projectTypesHeading: 'Where This Capability Applies',
    projectTypesIntro:
      'General construction coordination supports a range of public-sector project requirements.',
    projectTypes: [
      'Government facility construction and renovation',
      'Interior build-outs and tenant improvements',
      'Building envelope, roofing, and exterior work',
      'Site improvements supporting a building scope',
      'Repair, alteration, and modernization work',
      'Multi-trade projects requiring a single coordinating contractor',
    ],

    audiences: [
      {
        label: 'Federal Government',
        description:
          'Federal agencies and installations requiring construction services.',
      },
      {
        label: 'State Government',
        description:
          'State agencies and departments with construction and facility needs.',
      },
      {
        label: 'County & Municipal Government',
        description: 'Local government bodies requiring project delivery.',
      },
      {
        label: 'Prime Contractors',
        description:
          'General and prime contractors seeking a capable subcontractor or teaming partner.',
      },
    ],

    safetyQuality: [
      {
        icon: 'Shield',
        title: 'Site Safety Coordination',
        description:
          'Safety expectations are established before mobilization and reinforced through daily coordination on site.',
      },
      {
        icon: 'FileCheck',
        title: 'Inspection & Verification',
        description:
          'Work is verified against project specifications at defined checkpoints, not only at closeout.',
      },
      {
        icon: 'ClipboardList',
        title: 'Documentation Trail',
        description:
          'Daily reports, submittals, and inspection records are maintained so the project file stays current.',
      },
      {
        icon: 'CheckCircle2',
        title: 'Corrective Action',
        description:
          'Deficiencies are tracked to closure with clear ownership and a documented resolution.',
      },
    ],

    processSteps: [
      {
        step: 1,
        title: 'Review the Project Requirement',
        description:
          'Understand the scope, specifications, and delivery expectations.',
      },
      {
        step: 2,
        title: 'Confirm Scope & Delivery Needs',
        description:
          'Align on project requirements, timelines, and coordination expectations.',
      },
      {
        step: 3,
        title: 'Establish the Execution Approach',
        description:
          'Develop the project plan, schedule, and resource strategy.',
      },
      {
        step: 4,
        title: 'Coordinate Performance & Documentation',
        description:
          'Execute the work with organized communication and tracking.',
      },
      {
        step: 5,
        title: 'Complete Closeout Requirements',
        description:
          'Finalize inspections, documentation, and project turnover.',
      },
    ],

    faqs: [
      {
        question:
          'What does TX4 Contracting provide as a general construction contractor?',
        answer:
          'TX4 Contracting coordinates general construction work for government projects, including planning, scheduling, trade and vendor coordination, field execution, safety coordination, quality documentation, and closeout. One team is accountable for the full scope rather than the agency managing several independent vendors.',
      },
      {
        question: 'Who can contract with TX4 Contracting?',
        answer:
          'TX4 works with federal, state, county, and municipal agencies, and with prime contractors that need a subcontractor or teaming partner on a government solicitation.',
      },
      {
        question: 'Where does TX4 Contracting perform work?',
        answer:
          'TX4 Contracting serves Texas. Project locations outside the standard service area can be discussed during qualification.',
      },
      {
        question: 'How does a government buyer start a conversation with TX4?',
        answer:
          'Submit a project or contract inquiry through the contact page with the solicitation or contract number, the capability required, the project location, and the response deadline. TX4 reviews the requirement and responds with next steps.',
      },
    ],

    relatedCapabilities: [],
    published: true,
  },

  /* ------------------------------------------------------------------ *
   * DRAFT CAPABILITIES - NOT PUBLISHED
   *
   * Complete templates awaiting confirmation from TX4 that the service is
   * actually performed. Set `published: true` only after the service, scope
   * language, and any implied claims have been verified.
   * ------------------------------------------------------------------ */

  {
    slug: 'civil-and-sitework',
    title: 'Civil & Sitework',
    heroTitle: 'Civil Construction & Sitework',
    shortDescription:
      'Site preparation, grading, drainage, and underground utility coordination supporting public infrastructure and facility projects.',
    heroDescription:
      'TX4 Contracting coordinates civil and sitework scopes that prepare a site for construction or restore public infrastructure to specification.',
    metaTitle: 'Civil & Sitework',
    metaDescription:
      'Civil construction and sitework coordination for government agencies and prime contractors, including site preparation, grading, drainage, and utility scopes.',
    icon: 'Layers',

    overviewHeading: 'Groundwork That Sets the Schedule',
    overview: [
      'Sitework determines whether the rest of a project stays on schedule. TX4 Contracting coordinates the survey, earthwork, drainage, and utility activities that have to be sequenced correctly before vertical construction can proceed.',
      'The same single-point accountability applied to building work applies here: one team plans the sequence, coordinates the trades, and maintains the documentation the project record requires.',
    ],

    deliveryHeading: 'Sitework Coordination',
    deliveryIntro:
      'Civil scopes TX4 coordinates on government and public infrastructure projects.',
    deliveryAreas: [
      {
        icon: 'Ruler',
        title: 'Site Preparation & Layout',
        description:
          'Clearing, staking, and preparing the site so downstream work can begin on schedule.',
      },
      {
        icon: 'Layers',
        title: 'Earthwork & Grading',
        description:
          'Cut, fill, and grading activities coordinated against the project survey and specifications.',
      },
      {
        icon: 'Recycle',
        title: 'Drainage & Stormwater',
        description:
          'Drainage structures and stormwater controls coordinated with permitting requirements.',
      },
      {
        icon: 'Zap',
        title: 'Underground Utilities',
        description:
          'Coordination of utility locates, trenching, and installation with the responsible utility owners.',
      },
      {
        icon: 'Hammer',
        title: 'Paving & Flatwork',
        description:
          'Coordination of concrete and asphalt scopes including access drives, walks, and pads.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Erosion & Sediment Control',
        description:
          'Installation and maintenance of controls with the inspection records regulators expect.',
      },
    ],

    projectTypesHeading: 'Where This Capability Applies',
    projectTypesIntro:
      'Civil and sitework scopes support both standalone infrastructure work and building projects.',
    projectTypes: [
      'Site preparation ahead of facility construction',
      'Parking, access drive, and pavement repair',
      'Drainage and stormwater improvements',
      'Utility installation and relocation coordination',
      'Grading and site restoration',
      'Public infrastructure maintenance scopes',
    ],

    audiences: [
      {
        label: 'Public Works Departments',
        description:
          'Municipal and county departments responsible for roads, drainage, and public facilities.',
      },
      {
        label: 'Federal & State Agencies',
        description:
          'Agencies with site improvement or infrastructure repair requirements.',
      },
      {
        label: 'Prime Contractors',
        description:
          'Primes needing a coordinated civil subcontractor on a larger delivery.',
      },
      {
        label: 'Facility Owners',
        description:
          'Public facility owners addressing site conditions, access, or drainage issues.',
      },
    ],

    safetyQuality: [
      {
        icon: 'Shield',
        title: 'Excavation Safety',
        description:
          'Utility locates, trench protection, and access controls are confirmed before ground is broken.',
      },
      {
        icon: 'FileCheck',
        title: 'Survey & Grade Verification',
        description:
          'Elevations and grades are verified against the survey rather than assumed from field judgment.',
      },
      {
        icon: 'ClipboardList',
        title: 'Environmental Compliance Records',
        description:
          'Erosion control inspections and related records are maintained through the life of the work.',
      },
      {
        icon: 'CheckCircle2',
        title: 'Restoration Verification',
        description:
          'Disturbed areas are restored and documented before the scope is considered complete.',
      },
    ],

    processSteps: [
      {
        step: 1,
        title: 'Review Site Conditions & Documents',
        description:
          'Assess the survey, geotechnical information, and permitting requirements.',
      },
      {
        step: 2,
        title: 'Confirm Sequence & Access',
        description:
          'Establish the work sequence, site access, and coordination with other trades.',
      },
      {
        step: 3,
        title: 'Mobilize Controls & Resources',
        description:
          'Install site controls and stage equipment and materials for the scope.',
      },
      {
        step: 4,
        title: 'Execute & Verify',
        description:
          'Perform the work with grade and compaction verification at defined checkpoints.',
      },
      {
        step: 5,
        title: 'Restore & Close Out',
        description:
          'Complete restoration, final inspections, and as-built documentation.',
      },
    ],

    faqs: [
      {
        question: 'What civil and sitework scopes does TX4 coordinate?',
        answer:
          'TX4 coordinates site preparation, earthwork and grading, drainage and stormwater structures, underground utility work, paving and flatwork, and erosion and sediment control.',
      },
      {
        question: 'Can TX4 perform sitework as a subcontractor to a prime?',
        answer:
          'Yes. TX4 works as a subcontractor or teaming partner on civil scopes within a larger prime contract.',
      },
    ],

    relatedCapabilities: ['general-construction'],
    published: false,
  },

  {
    slug: 'facility-repair-and-maintenance',
    title: 'Facility Repair & Maintenance',
    heroTitle: 'Facility Repair, Alteration & Maintenance',
    shortDescription:
      'Repair, alteration, and recurring maintenance work for government buildings, coordinated around occupied-facility constraints.',
    heroDescription:
      'TX4 Contracting coordinates repair, alteration, and maintenance scopes in government facilities, including work that must be performed around building occupants and operating hours.',
    metaTitle: 'Facility Repair & Maintenance',
    metaDescription:
      'Facility repair, alteration, and maintenance coordination for government buildings, including occupied-facility work, task orders, and recurring service scopes.',
    icon: 'Wrench',

    overviewHeading: 'Work That Fits Around Operations',
    overview: [
      'Repair and alteration work in a government facility rarely happens in an empty building. Scheduling, access control, dust and noise management, and phasing matter as much as the work itself.',
      'TX4 Contracting coordinates these scopes with the facility manager so the building keeps operating while the work moves forward.',
    ],

    deliveryHeading: 'Repair & Maintenance Coordination',
    deliveryIntro: 'Scopes TX4 coordinates for public-sector facility owners.',
    deliveryAreas: [
      {
        icon: 'Hammer',
        title: 'Repair & Alteration',
        description:
          'Building repairs and alterations coordinated against the facility owner\u2019s requirements.',
      },
      {
        icon: 'Layers',
        title: 'Interior Modifications',
        description:
          'Partition, finish, door, and hardware scopes in occupied buildings.',
      },
      {
        icon: 'Gauge',
        title: 'Building System Coordination',
        description:
          'Coordination of licensed mechanical, electrical, and plumbing trades for facility work.',
      },
      {
        icon: 'Calendar',
        title: 'Phasing & After-Hours Work',
        description:
          'Scheduling around occupancy, operating hours, and access restrictions.',
      },
      {
        icon: 'ClipboardList',
        title: 'Task-Order Response',
        description:
          'Responding to individual task orders and defined maintenance requirements.',
      },
      {
        icon: 'FileText',
        title: 'Service Documentation',
        description:
          'Recording work performed, materials used, and completion sign-off.',
      },
    ],

    projectTypesHeading: 'Where This Capability Applies',
    projectTypesIntro:
      'Facility scopes range from single repairs to recurring maintenance requirements.',
    projectTypes: [
      'Building repair and alteration task orders',
      'Interior finish and partition modifications',
      'Door, hardware, and accessibility upgrades',
      'Roof and envelope repair coordination',
      'Recurring facility maintenance scopes',
      'Work in occupied or secured facilities',
    ],

    audiences: [
      {
        label: 'Facility Managers',
        description:
          'Government facility managers responsible for building condition and uptime.',
      },
      {
        label: 'Federal & State Agencies',
        description:
          'Agencies issuing repair, alteration, or maintenance task orders.',
      },
      {
        label: 'County & Municipal Government',
        description:
          'Local governments maintaining public buildings and service facilities.',
      },
      {
        label: 'Prime Contractors',
        description:
          'Primes holding facility maintenance contracts that need coordinated support.',
      },
    ],

    safetyQuality: [
      {
        icon: 'Shield',
        title: 'Occupant Protection',
        description:
          'Barriers, signage, and access controls protect building occupants during the work.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Access & Escort Compliance',
        description:
          'Badging, escort, and security requirements are confirmed before crews arrive.',
      },
      {
        icon: 'FileCheck',
        title: 'Completion Verification',
        description:
          'Work is walked with the facility representative before it is reported complete.',
      },
      {
        icon: 'ClipboardList',
        title: 'Service Records',
        description:
          'Each task order is documented so the facility owner keeps an accurate maintenance history.',
      },
    ],

    processSteps: [
      {
        step: 1,
        title: 'Receive the Requirement',
        description:
          'Review the task order, work request, or maintenance requirement.',
      },
      {
        step: 2,
        title: 'Assess Site Conditions',
        description:
          'Confirm access, occupancy constraints, and existing conditions.',
      },
      {
        step: 3,
        title: 'Schedule Around Operations',
        description:
          'Agree on phasing, working hours, and occupant impact with the facility owner.',
      },
      {
        step: 4,
        title: 'Perform & Document',
        description:
          'Complete the work with daily documentation and occupant protection in place.',
      },
      {
        step: 5,
        title: 'Verify & Report',
        description:
          'Walk the completed work with the facility representative and submit records.',
      },
    ],

    faqs: [
      {
        question: 'Can TX4 perform work in an occupied government building?',
        answer:
          'Yes. Occupied-facility work is scheduled around operating hours and access restrictions, with occupant protection and security requirements confirmed before mobilization.',
      },
      {
        question: 'Does TX4 respond to individual task orders?',
        answer:
          'Yes. TX4 coordinates individual repair and alteration task orders as well as recurring maintenance scopes.',
      },
    ],

    relatedCapabilities: ['general-construction'],
    published: false,
  },

  {
    slug: 'logistics-and-procurement',
    title: 'Logistics & Procurement',
    heroTitle: 'Construction Logistics & Materials Procurement',
    shortDescription:
      'Sourcing, staging, and delivery coordination for materials and equipment supporting government project requirements.',
    heroDescription:
      'TX4 Contracting coordinates materials procurement, staging, and delivery so project schedules are not held up by supply gaps.',
    metaTitle: 'Logistics & Procurement',
    metaDescription:
      'Construction logistics and materials procurement coordination for government agencies and prime contractors, including sourcing, staging, and delivery scheduling.',
    icon: 'Truck',

    overviewHeading: 'Materials Where They Need To Be',
    overview: [
      'Schedule delays on public projects are frequently supply problems rather than labor problems. TX4 Contracting coordinates sourcing, lead-time tracking, staging, and delivery so materials arrive when the sequence calls for them.',
      'Procurement documentation is maintained alongside the delivery record so the project file supports the invoice.',
    ],

    deliveryHeading: 'Logistics Coordination',
    deliveryIntro:
      'Supply and logistics activities TX4 coordinates on project scopes.',
    deliveryAreas: [
      {
        icon: 'PackageSearch',
        title: 'Sourcing & Vendor Qualification',
        description:
          'Identifying suppliers that can meet specification, quantity, and schedule requirements.',
      },
      {
        icon: 'Clock',
        title: 'Lead-Time Tracking',
        description:
          'Monitoring long-lead items against the project schedule and flagging risk early.',
      },
      {
        icon: 'Truck',
        title: 'Delivery Scheduling',
        description:
          'Coordinating deliveries with site access, receiving hours, and installation sequence.',
      },
      {
        icon: 'Layers',
        title: 'Staging & Site Storage',
        description:
          'Organizing laydown and storage so materials are protected and retrievable.',
      },
      {
        icon: 'FileText',
        title: 'Procurement Documentation',
        description:
          'Maintaining purchase, submittal, and delivery records for the project file.',
      },
      {
        icon: 'CheckCircle2',
        title: 'Receiving & Verification',
        description:
          'Confirming quantity and condition on receipt and resolving discrepancies with the supplier.',
      },
    ],

    projectTypesHeading: 'Where This Capability Applies',
    projectTypesIntro:
      'Logistics support can stand alone or sit inside a larger construction scope.',
    projectTypes: [
      'Materials procurement for a defined project scope',
      'Long-lead equipment tracking and expediting',
      'Delivery and staging coordination on constrained sites',
      'Supply support for prime contractor schedules',
      'Equipment and material staging for mobilization',
    ],

    audiences: [
      {
        label: 'Prime Contractors',
        description:
          'Primes needing supply coordination support on an active project.',
      },
      {
        label: 'Government Buyers',
        description:
          'Agencies procuring materials or equipment against a defined requirement.',
      },
      {
        label: 'Project Managers',
        description:
          'Public-sector project managers tracking long-lead risk on a schedule.',
      },
    ],

    safetyQuality: [
      {
        icon: 'FileCheck',
        title: 'Specification Conformance',
        description:
          'Materials are checked against the specification and approved submittals before installation.',
      },
      {
        icon: 'Shield',
        title: 'Safe Handling & Storage',
        description:
          'Loading, unloading, and storage practices are coordinated to protect crews and materials.',
      },
      {
        icon: 'ClipboardList',
        title: 'Chain of Documentation',
        description:
          'Purchase orders, delivery tickets, and receiving records are retained together.',
      },
    ],

    processSteps: [
      {
        step: 1,
        title: 'Define the Requirement',
        description:
          'Confirm specification, quantity, delivery location, and required dates.',
      },
      {
        step: 2,
        title: 'Source & Qualify',
        description: 'Identify suppliers able to meet the requirement.',
      },
      {
        step: 3,
        title: 'Schedule Delivery',
        description:
          'Align delivery with site access, receiving hours, and installation sequence.',
      },
      {
        step: 4,
        title: 'Receive & Verify',
        description: 'Confirm quantity and condition and document receipt.',
      },
      {
        step: 5,
        title: 'Close the Record',
        description:
          'Submit procurement and delivery documentation for the project file.',
      },
    ],

    faqs: [
      {
        question:
          'Does TX4 provide procurement support separate from construction?',
        answer:
          'Procurement and logistics coordination can be provided as part of a construction scope or as a standalone requirement, depending on how the solicitation is structured.',
      },
    ],

    relatedCapabilities: ['general-construction'],
    published: false,
  },

  {
    slug: 'emergency-response-support',
    title: 'Emergency Response Support',
    heroTitle: 'Emergency & Rapid-Response Construction Support',
    shortDescription:
      'Rapid mobilization for urgent facility damage, storm response, and temporary restoration of public operations.',
    heroDescription:
      'TX4 Contracting supports agencies responding to urgent facility damage and service interruptions, with mobilization organized around the response window rather than a standard schedule.',
    metaTitle: 'Emergency Response Support',
    metaDescription:
      'Rapid-response construction support for government agencies, including damage assessment, temporary stabilization, debris coordination, and restoration of facility operations.',
    icon: 'Siren',

    overviewHeading: 'Mobilization Under Time Pressure',
    overview: [
      'Emergency work is judged on response time and documentation. Agencies need a contractor who can mobilize quickly and produce a defensible record of what was done, when, and why.',
      'TX4 Contracting organizes response scopes around both requirements: get the facility operating, and document the work to the standard reimbursement and audit review will demand.',
    ],

    deliveryHeading: 'Response Support',
    deliveryIntro:
      'Activities TX4 coordinates during and after an emergency event.',
    deliveryAreas: [
      {
        icon: 'ClipboardList',
        title: 'Damage Assessment Support',
        description:
          'Documenting observed conditions to support scoping and reimbursement review.',
      },
      {
        icon: 'Shield',
        title: 'Temporary Stabilization',
        description:
          'Securing damaged areas to limit further loss and protect occupants.',
      },
      {
        icon: 'Truck',
        title: 'Debris & Access Coordination',
        description:
          'Coordinating removal and site access so response work can proceed.',
      },
      {
        icon: 'Wrench',
        title: 'Restoration of Operations',
        description:
          'Coordinating repairs that return the facility to usable condition.',
      },
      {
        icon: 'FileText',
        title: 'Response Documentation',
        description:
          'Maintaining time, materials, and photographic records throughout the response.',
      },
      {
        icon: 'Clock',
        title: 'Rapid Mobilization',
        description:
          'Organizing crews and equipment against the agency\u2019s required response window.',
      },
    ],

    projectTypesHeading: 'Where This Capability Applies',
    projectTypesIntro:
      'Response scopes vary with the event and the facility affected.',
    projectTypes: [
      'Storm and weather damage response',
      'Water intrusion and building envelope failures',
      'Temporary stabilization and securing of damaged areas',
      'Emergency access restoration',
      'Follow-on permanent repair scopes',
    ],

    audiences: [
      {
        label: 'Emergency Management Agencies',
        description:
          'Agencies coordinating response and recovery for public facilities.',
      },
      {
        label: 'Facility Owners',
        description:
          'Public facility owners needing to restore operations quickly.',
      },
      {
        label: 'Prime Contractors',
        description:
          'Primes holding response contracts that need additional coordinated capacity.',
      },
    ],

    safetyQuality: [
      {
        icon: 'Shield',
        title: 'Hazard Assessment First',
        description:
          'Structural, electrical, and environmental hazards are assessed before crews enter a damaged area.',
      },
      {
        icon: 'ClipboardList',
        title: 'Time & Materials Records',
        description:
          'Labor, equipment, and materials are recorded daily to support reimbursement review.',
      },
      {
        icon: 'FileCheck',
        title: 'Photographic Documentation',
        description:
          'Conditions are photographed before, during, and after the response work.',
      },
    ],

    processSteps: [
      {
        step: 1,
        title: 'Receive the Response Request',
        description:
          'Confirm the affected facility, the hazard, and the required response window.',
      },
      {
        step: 2,
        title: 'Assess & Document Conditions',
        description: 'Record observed damage and identify immediate hazards.',
      },
      {
        step: 3,
        title: 'Stabilize & Secure',
        description: 'Limit further loss and make the area safe.',
      },
      {
        step: 4,
        title: 'Restore Operations',
        description:
          'Coordinate the repairs needed to return the facility to use.',
      },
      {
        step: 5,
        title: 'Submit the Response Record',
        description:
          'Provide the documentation package covering the full response.',
      },
    ],

    faqs: [
      {
        question: 'How quickly can TX4 mobilize for an emergency requirement?',
        answer:
          'Mobilization timing depends on the location, the scope, and the resources required. Response expectations are confirmed with the agency at the time of the request.',
      },
    ],

    relatedCapabilities: [
      'general-construction',
      'facility-repair-and-maintenance',
    ],
    published: false,
  },

  {
    slug: 'specialty-support-services',
    title: 'Specialty Support Services',
    heroTitle: 'Specialty Trade & Project Support Services',
    shortDescription:
      'Coordinated specialty trade support for scopes that fall outside a standard general construction package.',
    heroDescription:
      'TX4 Contracting organizes qualified specialty firms for scopes that require licensed or certified trades, keeping coordination and documentation under one accountable team.',
    metaTitle: 'Specialty Support Services',
    metaDescription:
      'Specialty trade coordination for government projects, including licensed trades, certified scopes, and support services alongside general construction work.',
    icon: 'Wrench',

    overviewHeading: 'Specialty Scopes, Single Point of Contact',
    overview: [
      'Some project scopes require licensed or certified specialty firms. Coordinating them individually adds administrative load for the agency and creates gaps in accountability.',
      'TX4 Contracting organizes those firms under one point of contact, so the agency deals with a single coordinating contractor while the specialists perform the work they are qualified for.',
    ],

    deliveryHeading: 'Specialty Coordination',
    deliveryIntro:
      'How TX4 organizes specialty scopes on a government project.',
    deliveryAreas: [
      {
        icon: 'Users',
        title: 'Specialty Firm Qualification',
        description:
          'Verifying licensing, certification, and insurance before a firm is brought onto a scope.',
      },
      {
        icon: 'Calendar',
        title: 'Scope Sequencing',
        description:
          'Fitting specialty work into the overall project schedule without idle time.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Compliance Tracking',
        description:
          'Confirming that certification and reporting requirements are met and documented.',
      },
      {
        icon: 'MessageSquare',
        title: 'Single Point of Contact',
        description:
          'One coordinating contact for the agency regardless of how many firms are on site.',
      },
    ],

    projectTypesHeading: 'Where This Capability Applies',
    projectTypesIntro:
      'Specialty support typically supplements a broader project scope.',
    projectTypes: [
      'Licensed trade scopes within a larger project',
      'Certified or regulated work requiring qualified firms',
      'Scopes needing specialized equipment or methods',
      'Support services alongside a general construction package',
    ],

    audiences: [
      {
        label: 'Government Agencies',
        description:
          'Agencies with project scopes that require certified or licensed specialty firms.',
      },
      {
        label: 'Prime Contractors',
        description:
          'Primes needing coordinated specialty capacity under an existing contract.',
      },
    ],

    safetyQuality: [
      {
        icon: 'ShieldCheck',
        title: 'Credential Verification',
        description:
          'Licenses, certifications, and insurance are verified before work begins.',
      },
      {
        icon: 'ClipboardList',
        title: 'Consolidated Documentation',
        description:
          'Specialty records are collected into the single project file the agency receives.',
      },
    ],

    processSteps: [
      {
        step: 1,
        title: 'Define the Specialty Requirement',
        description:
          'Confirm what licensing, certification, or method the scope requires.',
      },
      {
        step: 2,
        title: 'Qualify the Firms',
        description: 'Verify credentials, insurance, and relevant experience.',
      },
      {
        step: 3,
        title: 'Sequence the Work',
        description:
          'Fit the specialty scope into the overall project schedule.',
      },
      {
        step: 4,
        title: 'Coordinate & Document',
        description:
          'Manage performance and collect required records under one file.',
      },
    ],

    faqs: [
      {
        question: 'Does TX4 self-perform specialty trade work?',
        answer:
          'Specialty scopes are performed by qualified licensed or certified firms coordinated by TX4. Which scopes are self-performed versus subcontracted is confirmed during qualification for each project.',
      },
    ],

    relatedCapabilities: ['general-construction'],
    published: false,
  },
];

export function getPublishedCapabilities(): Capability[] {
  return capabilities.filter((c) => c.published);
}

export function getCapabilityBySlug(slug: string): Capability | null {
  return capabilities.find((c) => c.slug === slug && c.published) ?? null;
}

/** Related capabilities, filtered to those that are actually published. */
export function getRelatedCapabilities(capability: Capability): Capability[] {
  return capability.relatedCapabilities
    .map((slug) => getCapabilityBySlug(slug))
    .filter((c): c is Capability => c !== null && c.slug !== capability.slug);
}
