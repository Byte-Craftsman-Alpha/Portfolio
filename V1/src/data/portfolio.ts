// ─── Central Data Model ───────────────────────────────────────────────
// All portfolio content lives here. Edit values to update the site.

export interface Project {
  id: string;
  title: string;
  tagline: string;
  domain: string;
  technologies: string[];
  status: 'shipped' | 'active' | 'fork' | 'experiment' | 'learning';
  repository: string;
  caseStudy: {
    problem: string;
    role: string;
    stack: string[];
    architecture: string;
    outcome: string;
  };
  featured: boolean;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface LearningItem {
  label: string;
  status: 'current' | 'next' | 'exploring';
  note: string;
}

export interface Metric {
  label: string;
  value: string;
  source: 'github' | 'self';
  editable?: boolean;
}

// ─── Personal ────────────────────────────────────────────────────────
export const personal = {
  name: 'Aditya Chaudhari',
  initials: 'AC',
  role: 'Python-Led Full-Stack Engineer',
  tagline: 'B.Tech IT · India',
  valueProposition:
    'A practical engineer building useful systems — from backend APIs and real-time messaging to browser automation, computer vision, and civic technology.',
  github: 'https://github.com/Byte-Craftsman-Alpha',
  githubUsername: 'Byte-Craftsman-Alpha',
  linkedin: 'https://www.linkedin.com/in/byte-craftsman-alpha',
  email: 'aditya@teamparadox.in',
  resumeUrl: 'https://github.com/Byte-Craftsman-Alpha/Byte-Craftsman-Alpha/blob/main/Aditya%20Resume.pdf',
} as const;

// ─── Proof Metrics ───────────────────────────────────────────────────
export const metrics: Metric[] = [
  { label: 'Repositories', value: '9+', source: 'github' },
  { label: 'Languages', value: '5', source: 'github' },
  { label: 'Domains', value: '8', source: 'self', editable: true },
  { label: 'Projects Shipped', value: '5', source: 'self', editable: true },
];

// ─── Projects ────────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: 'edu-portal',
    title: 'Edu-Portal',
    tagline: 'Education platform for structured learning delivery',
    domain: 'Education',
    technologies: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3', 'Bootstrap'],
    status: 'shipped',
    repository: 'https://github.com/Byte-Craftsman-Alpha/Edu-Portal',
    caseStudy: {
      problem:
        'Educational institutions need a lightweight, self-hosted platform for course delivery and student management without reliance on expensive SaaS.',
      role: 'Sole developer — full design, backend, and integration',
      stack: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3', 'Bootstrap'],
      architecture:
        'Flask monolith serving templated pages. SQLite for persistence. Bootstrap for responsive UI. Session-based auth with role routing.',
      outcome:
        'Functional education portal with course management, student enrollment, and role-based access. Self-contained deployment with no external database dependency.',
    },
    featured: true,
  },
  {
    id: 'road-maintenance',
    title: 'Road-Maintenance-System',
    tagline: 'Civic tech for reporting and tracking road infrastructure issues',
    domain: 'Civic Technology',
    technologies: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3', 'Bootstrap'],
    status: 'shipped',
    repository: 'https://github.com/Byte-Craftsman-Alpha/Road-Maintenance-System',
    caseStudy: {
      problem:
        'Municipal road maintenance relies on fragmented complaint channels with no tracking, leading to delayed repairs and no accountability.',
      role: 'Sole developer — system design, backend, and frontend',
      stack: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3', 'Bootstrap'],
      architecture:
        'Flask application with issue reporting workflow. SQLite stores complaints with status tracking. Geo-tagging support for issue location. Admin dashboard for municipal staff.',
      outcome:
        'End-to-end road issue reporting system with status lifecycle (reported → reviewed → in-progress → resolved). Demonstrates civic technology thinking.',
    },
    featured: true,
  },
  {
    id: 'doc-vault',
    title: 'Doc-Vault',
    tagline: 'Secure document storage and retrieval system',
    domain: 'Document Storage',
    technologies: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3'],
    status: 'shipped',
    repository: 'https://github.com/Byte-Craftsman-Alpha/Doc-Vault',
    caseStudy: {
      problem:
        'Small organizations need a simple, self-hosted document management system without the complexity of enterprise DMS solutions.',
      role: 'Sole developer — architecture, backend, and UI',
      stack: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3'],
      architecture:
        'Flask server handling file uploads, metadata indexing, and search. SQLite for document metadata. File system for blob storage with organized directory structure.',
      outcome:
        'Lightweight document vault with upload, categorization, search, and retrieval. No external dependencies beyond Python and Flask.',
    },
    featured: true,
  },
  {
    id: 'healthcare-portal',
    title: 'HealthCarePortal',
    tagline: 'Healthcare workflow management for patient and provider coordination',
    domain: 'Healthcare',
    technologies: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3', 'Bootstrap'],
    status: 'shipped',
    repository: 'https://github.com/Byte-Craftsman-Alpha/HealthCarePortal',
    caseStudy: {
      problem:
        'Local healthcare providers lack affordable digital workflow tools for patient registration, appointment scheduling, and record management.',
      role: 'Sole developer — full system implementation',
      stack: ['Python', 'Flask', 'SQLite', 'HTML5', 'CSS3', 'Bootstrap'],
      architecture:
        'Flask application with patient registration, appointment scheduling, and basic health record management. SQLite for data persistence. Role-based views for patients and providers.',
      outcome:
        'Working healthcare portal demonstrating domain-aware engineering. Patient-provider workflow with appointment lifecycle and basic record keeping.',
    },
    featured: true,
  },
  {
    id: 'excel-to-sqlite',
    title: 'EXCEL-TO-SQLITE',
    tagline: 'Data ingestion pipeline from spreadsheets to structured storage',
    domain: 'Data Ingestion',
    technologies: ['Python', 'SQLite'],
    status: 'shipped',
    repository: 'https://github.com/Byte-Craftsman-Alpha/EXCEL-TO-SQLITE',
    caseStudy: {
      problem:
        'Organizations store data in Excel files that are hard to query, validate, or integrate. Manual conversion is error-prone and time-consuming.',
      role: 'Sole developer — parsing logic and database mapping',
      stack: ['Python', 'SQLite'],
      architecture:
        'Python script reading Excel files via openpyxl/pandas, validating schema, and writing normalized records to SQLite. Handles type coercion and duplicate detection.',
      outcome:
        'Reliable Excel-to-SQLite conversion tool with schema validation and error reporting. Demonstrates data engineering fundamentals.',
    },
    featured: true,
  },
  {
    id: 'lan-messaging',
    title: 'LAN Messaging Web App',
    tagline: 'Real-time local network communication via WebSocket',
    domain: 'Real-Time Communication',
    technologies: ['Python', 'Flask', 'WebSocket', 'HTML5', 'CSS3', 'JavaScript'],
    status: 'active',
    repository: 'https://github.com/Byte-Craftsman-Alpha/LAN-Messaging-Web-App',
    caseStudy: {
      problem:
        'Teams on the same local network need instant messaging without relying on external services or internet connectivity.',
      role: 'Sole developer — WebSocket server and client implementation',
      stack: ['Python', 'Flask', 'WebSocket', 'HTML5', 'CSS3', 'JavaScript'],
      architecture:
        'Flask-SocketIO server managing WebSocket connections. Broadcast and direct message support. HTML/JS client with real-time message rendering. No external message broker.',
      outcome:
        'Functional LAN messenger with real-time delivery, multi-user support, and minimal infrastructure requirements. Demonstrates WebSocket proficiency.',
    },
    featured: false,
  },
  {
    id: 'web-automation',
    title: 'Web Automation Suite',
    tagline: 'Browser automation toolkit for repetitive web tasks',
    domain: 'Browser Automation',
    technologies: ['Python', 'Selenium'],
    status: 'active',
    repository: 'https://github.com/Byte-Craftsman-Alpha/Web-Automation-Suite',
    caseStudy: {
      problem:
        'Repetitive web interactions — form filling, data scraping, testing — consume significant manual time and are error-prone when done by hand.',
      role: 'Sole developer — automation scripts and framework',
      stack: ['Python', 'Selenium'],
      architecture:
        'Python scripts using Selenium WebDriver for browser control. Modular task definitions. Headless and headed modes. Configurable wait strategies and error recovery.',
      outcome:
        'Reusable automation framework handling common web tasks. Demonstrates browser control, DOM interaction, and robust error handling.',
    },
    featured: false,
  },
  {
    id: 'face-detection',
    title: 'Face Detection System',
    tagline: 'Computer vision pipeline for real-time face detection',
    domain: 'Computer Vision',
    technologies: ['Python', 'OpenCV'],
    status: 'active',
    repository: 'https://github.com/Byte-Craftsman-Alpha/Face-Detection-System',
    caseStudy: {
      problem:
        'Real-time face detection is a foundational CV task with applications in security, attendance, and human-computer interaction, but requires practical implementation skill.',
      role: 'Sole developer — detection pipeline and optimization',
      stack: ['Python', 'OpenCV'],
      architecture:
        'OpenCV Haar cascade classifier for face detection. Video capture from webcam. Frame processing pipeline with bounding box rendering. Configurable detection parameters.',
      outcome:
        'Working real-time face detection system. Demonstrates computer vision fundamentals and OpenCV proficiency.',
    },
    featured: false,
  },
  {
    id: 'identity-ocr',
    title: 'Identity / OCR Utilities',
    tagline: 'Optical character recognition for identity document processing',
    domain: 'Document Storage',
    technologies: ['Python', 'OpenCV'],
    status: 'experiment',
    repository: 'https://github.com/Byte-Craftsman-Alpha',
    caseStudy: {
      problem:
        'Extracting text from identity documents (Aadhaar, PAN, etc.) manually is slow and error-prone. OCR automation can accelerate verification workflows.',
      role: 'Sole developer — OCR pipeline and text extraction',
      stack: ['Python', 'OpenCV'],
      architecture:
        'Image preprocessing (deskew, denoise, threshold) followed by OCR extraction. Field pattern matching for structured identity data. OpenCV for image handling.',
      outcome:
        'Experimental OCR utility for identity documents. Demonstrates image preprocessing and text extraction. Labeled as experiment — not production-ready.',
    },
    featured: false,
  },
];

// ─── Skills / Capability Map ─────────────────────────────────────────
export const capabilities: Skill[] = [
  {
    category: 'Core Languages',
    items: ['Python', 'C', 'C++', 'Dart', 'JavaScript'],
  },
  {
    category: 'Web & Markup',
    items: ['HTML5', 'CSS3', 'Bootstrap'],
  },
  {
    category: 'Backend & API',
    items: ['Flask', 'WebSocket', 'REST APIs'],
  },
  {
    category: 'Data & Storage',
    items: ['SQLite', 'Excel Parsing', 'Data Ingestion'],
  },
  {
    category: 'Automation & CV',
    items: ['Selenium', 'OpenCV', 'OCR'],
  },
  {
    category: 'Learning',
    items: ['PyTorch', 'System Design', 'DevOps', 'Deployment Pipelines'],
  },
];

// ─── Engineering Principles ──────────────────────────────────────────
export const principles = [
  {
    title: 'Build What Is Needed',
    description:
      'Every project starts from a real problem — not a tutorial. I ship working systems, not portfolio decorations.',
  },
  {
    title: 'Self-Contained First',
    description:
      'Minimal external dependencies. SQLite over Postgres when it suffices. Flask over Django for control. Ship with what the problem demands.',
  },
  {
    title: 'Honest Labeling',
    description:
      'Experiments are labeled experiments. Forks are labeled forks. Learning projects are labeled learning. No inflated claims.',
  },
  {
    title: 'Domain Awareness',
    description:
      'I learn the domain before writing code. Healthcare workflows, civic processes, education delivery — the system serves the domain, not the other way around.',
  },
  {
    title: 'Practical Over Perfect',
    description:
      'A working system that solves the problem today beats a perfectly architected one that ships never. Refactor when the need is real.',
  },
];

// ─── Learning Timeline ───────────────────────────────────────────────
export const learningTimeline: LearningItem[] = [
  {
    label: 'PyTorch & Deep Learning',
    status: 'current',
    note: 'Building foundational understanding of neural networks, tensors, and training loops.',
  },
  {
    label: 'System Design',
    status: 'current',
    note: 'Studying distributed systems, scalability patterns, and architectural trade-offs.',
  },
  {
    label: 'DevOps & CI/CD',
    status: 'next',
    note: 'Docker, GitHub Actions, automated testing and deployment pipelines.',
  },
  {
    label: 'Deployment Pipelines',
    status: 'next',
    note: 'Production deployment strategies, monitoring, and infrastructure as code.',
  },
  {
    label: 'Advanced Python',
    status: 'exploring',
    note: 'Async programming, metaclasses, and deeper standard library mastery.',
  },
];

// ─── Domains for filtering ───────────────────────────────────────────
export const domains = [
  'All',
  'Education',
  'Civic Technology',
  'Document Storage',
  'Healthcare',
  'Data Ingestion',
  'Real-Time Communication',
  'Browser Automation',
  'Computer Vision',
] as const;

export type Domain = (typeof domains)[number];
