export interface VendorData {
  id: string;
  companyName: string;
  primaryIndustries: string[];
  confirmedServices: string[];
  confirmedTechStack: string[];
  nonSpecializedTechStack: string[];
  sampleProjects: string[];
  certifications: string[];
  partners: string[];
  companySize: string;
  sources: string[];
  // Agreement info
  focusArea: string;
  agreementStatus: string;
  agreementDocuments: string;
  contactPerson: string;
  emails: string[];
}

const splitField = (val: string): string[] =>
  val.split(/,\s*/).map(s => s.trim()).filter(Boolean);

const INITIAL_VENDORS: VendorData[] = [
  {
    id: 'vendor-1',
    companyName: 'GigLabz (GigBlaze)',
    primaryIndustries: splitField('Technology Consulting, Enterprise Architecture, Digital Platform Development, Real Estate, E-commerce'),
    confirmedServices: splitField('AI-Powered Digital Solutions, Technology Consulting, Custom Software Development, Mobile App Development, UI/UX Design, Cloud Migration'),
    confirmedTechStack: splitField('Java, Python, JavaScript, TypeScript, C#, PHP, React.js, Angular, Node.js, Spring Boot, Django, Flutter, AWS, Docker, Kubernetes'),
    nonSpecializedTechStack: splitField('Industrial OT/ICS Security, Hardware-level AI Silicon Design, Heavy Manufacturing Engineering, Aerospace & Defense Systems'),
    sampleProjects: splitField('Event Pipe Trace & Analysis App, Scalable Digital Platforms for Enterprise, Custom E-commerce Solutions, AI-driven Analytics Dashboards'),
    certifications: splitField('ISO 9001, ISO 27001'),
    partners: splitField('AWS, Microsoft, Cloudflare'),
    companySize: '11-50 employees',
    sources: ['https://giglabz.com/', 'LinkedIn', 'Tracxn'],
    focusArea: 'Cybersecurity / AI',
    agreementStatus: 'NDA',
    agreementDocuments: 'Available',
    contactPerson: 'Sukesh',
    emails: ['Sukesh@giglabz.com'],
  },
  {
    id: 'vendor-2',
    companyName: 'Glacien AI',
    primaryIndustries: splitField('Hospitality, Enterprise Software, Consumer Productivity, Healthcare, Smart Cities, Recycling & Sustainability'),
    confirmedServices: splitField('Custom AI Development, Agentic AI Systems, Generative AI Implementation, Intelligent Automation, Multi-agent Systems'),
    confirmedTechStack: splitField('LangChain, LlamaIndex, AutoGPT, GPT-4, Claude, Llama 3, Python, Node.js, Go, React, Docker, AWS, Vector Databases (Pinecone)'),
    nonSpecializedTechStack: splitField('Physical Infrastructure Cooling, Industrial Cybersecurity (OT), Blockchain/Web3, Legacy Mainframe Systems'),
    sampleProjects: splitField('AVA: AI Productivity Assistant, Hospitality AI Control, Recycling Automation for Amazon & Colgate (Project Glacier)'),
    certifications: ['Startup (Compliance in progress)'],
    partners: splitField('Amazon, Colgate, AWS'),
    companySize: '11-50 employees',
    sources: ['https://glacien.ai/', 'LinkedIn', 'Tracxn', 'PackWorld'],
    focusArea: 'AI & Data Analytics',
    agreementStatus: 'NDA',
    agreementDocuments: 'Available',
    contactPerson: 'PT',
    emails: ['pt@glacien.ai', 'vignesh.veerasekaran@glacien.ai', 'jegan@glacien.ai'],
  },
  {
    id: 'vendor-3',
    companyName: 'CS TECH Ai (Ceinsys Tech Ltd)',
    primaryIndustries: splitField('Infrastructure & Utilities, Geospatial Intelligence, Mobility & Smart Cities, Land & Natural Resources, Water & Energy'),
    confirmedServices: splitField('Geospatial Intelligence (GIS), Engineering Support (BIM, Digital Twin), Mobility Engineering, Emerging Tech (AI, Automation)'),
    confirmedTechStack: splitField('Esri ArcGIS, QGIS, Autodesk, Bentley MicroStation, BIM 360, Computer Vision for Geospatial, Oracle Spatial, PostGIS'),
    nonSpecializedTechStack: splitField('Consumer Mobile App Development (Non-GIS), Creative Media/Broadcasting Tech, Retail E-commerce, High-frequency Trading'),
    sampleProjects: splitField('Water Network Design (35k+ miles), Infrastructure Analysis (2.2M sq ft), Electrical Network Processing (100k+ miles)'),
    certifications: splitField('CMMI Level 5, ISO 9001, ISO 27001'),
    partners: splitField('Autodesk (Gold Partner), Esri, Bentley Systems, Microsoft'),
    companySize: '1,000+ employees (Publicly Listed)',
    sources: ['https://cstech.ai/', 'NSE/BSE Filings', 'LinkedIn'],
    focusArea: 'Cybersecurity Solutions / AI',
    agreementStatus: 'Association Agreement',
    agreementDocuments: 'Available',
    contactPerson: 'Rahul',
    emails: ['rahul.joharapurkar@cstech.ai', 'priyanka.pandit@cstech.ai'],
  },
  {
    id: 'vendor-4',
    companyName: 'Tiger Analytics',
    primaryIndustries: splitField('BFSI, Retail & Consumer Goods, Healthcare & Life Sciences, Manufacturing & Logistics, Technology & Media'),
    confirmedServices: splitField('AI & Advanced Analytics, Data Engineering, MLOps & Generative AI, Business Consulting, Marketing Analytics, Risk & Fraud Analytics'),
    confirmedTechStack: splitField('Python, R, SQL, Scala, Snowflake, Databricks, Apache Spark, AWS (SageMaker), Azure (Synapse), TensorFlow, PyTorch'),
    nonSpecializedTechStack: splitField('Industrial OT/ICS Security, Mechanical Engineering, Physical Security Systems, Embedded Systems Development'),
    sampleProjects: splitField('Oncology Predictive Model for Pharma, Retail Data Modernization on AWS, Fraud Detection for Global Banks'),
    certifications: splitField('ISO 27001, SOC 2 Type II'),
    partners: splitField('Snowflake, Databricks, AWS, Azure, GCP'),
    companySize: '5,001-10,000 employees',
    sources: ['https://www.tigeranalytics.com/', 'LinkedIn', 'Tracxn'],
    focusArea: 'AI Analytics',
    agreementStatus: 'Association Agreement',
    agreementDocuments: 'Available',
    contactPerson: 'Anurag',
    emails: ['anurag.anand01@tigeranalytics.com', 'sudarshan.lakka@tigeranalytics.com'],
  },
  {
    id: 'vendor-5',
    companyName: 'Quest Global',
    primaryIndustries: splitField('Aerospace & Defense, Automotive & Rail, Medical Devices, Hi-Tech & Energy, Oil & Gas'),
    confirmedServices: splitField('Product Engineering, Lifecycle Services, Digital Engineering (IoT, 5G), Software-Defined Vehicle Architecture, Embedded Software'),
    confirmedTechStack: splitField('C, C++, RTOS (QNX, VxWorks), AUTOSAR, CAD/CAM/CAE (CATIA, NX), MATLAB/Simulink, Azure IoT, AWS IoT, Computer Vision'),
    nonSpecializedTechStack: splitField('Pure-play Marketing/AdTech, Financial Trading Systems, Creative Content Production, Consumer Social Media Platforms'),
    sampleProjects: splitField('Managed Device Transformation for Automotive OEM, Equipment Automation for Industrial, Aero-engine Component Design'),
    certifications: splitField('ISO 9001, AS9100 (Aerospace), ISO 13485 (Medical), Great Place to Work'),
    partners: splitField('NVIDIA, Microsoft, AWS, Siemens, Ansys'),
    companySize: '21,000+ employees',
    sources: ['https://www.questglobal.com/', 'LinkedIn', 'Great Place to Work'],
    focusArea: 'IT & Cybersecurity',
    agreementStatus: 'Association Agreement',
    agreementDocuments: 'Available',
    contactPerson: 'Dinakar',
    emails: ['dinakar.k@quest-global.com', 'Anupa.Mathias@quest-global.com', 'rinaz.mohammed@quest-global.com'],
  },
  {
    id: 'vendor-6',
    companyName: 'Canarys Automations Limited',
    primaryIndustries: splitField('BFSI & Insurance, Retail & Manufacturing, Healthcare, Education, Telecommunications'),
    confirmedServices: splitField('DevOps & Cloud Solutions, Robotic Process Automation (RPA), SAP Solutions, Mobile App Development, Software Testing & QA'),
    confirmedTechStack: splitField('Azure DevOps, GitHub, Jenkins, Docker, Terraform, UiPath, Automation Anywhere, SAP S/4HANA, .NET, Java, Python'),
    nonSpecializedTechStack: splitField('Industrial OT Security, High-performance Computing (HPC), Hardware Silicon Design, Aerospace Engineering'),
    sampleProjects: splitField('TFS to Azure DevOps Migration for Edmentum, Copy Project Migration for ABB, SAP Implementation for Retail'),
    certifications: splitField('ISO 9001, ISO 27001'),
    partners: splitField('Microsoft (Gold Partner), SAP, UiPath, GitHub'),
    companySize: '501-1,000 employees (Publicly Listed)',
    sources: ['https://ecanarys.com/', 'NSE Emerge Filings', 'LinkedIn'],
    focusArea: 'AI Development',
    agreementStatus: 'NDA',
    agreementDocuments: 'Resolving comments',
    contactPerson: 'Ankur',
    emails: ['ankurrana@gmail.com', 'ashwini.patil@ecanarys.com'],
  },
  {
    id: 'vendor-7',
    companyName: 'Metasys (Independent Entity)',
    primaryIndustries: splitField('Cybersecurity, AI Development, Digital Transformation, Building Automation Consulting'),
    confirmedServices: splitField('AI-Powered Cybersecurity, Digital Strategy, Custom AI Development, Enterprise Automation Consulting'),
    confirmedTechStack: splitField('AI Frameworks, Cybersecurity Protocols, Cloud Infrastructure, Automation Tools'),
    nonSpecializedTechStack: splitField('HVAC Manufacturing, Physical Security Hardware, General E-commerce'),
    sampleProjects: splitField('AI-driven Cybersecurity Frameworks, Enterprise Digital Transformation Strategy'),
    certifications: splitField('ISO 27001, ISO 9001 (In progress)'),
    partners: splitField('Canarys, Tech Partners in AI/Cybersecurity'),
    companySize: '11-50 employees (Estimated)',
    sources: ['Vendor Agreement', 'LinkedIn'],
    focusArea: 'AI Development',
    agreementStatus: 'NDA',
    agreementDocuments: 'Resolving comments',
    contactPerson: 'Ankur',
    emails: ['ankurrana@gmail.com', 'ashwini.patil@ecanarys.com'],
  },
  {
    id: 'vendor-8',
    companyName: 'OpenStream.ai',
    primaryIndustries: splitField('Enterprise Customer Service, Healthcare & BFSI, Retail & Logistics, Technology, Automotive (In-car Assistants)'),
    confirmedServices: splitField('Conversational AI (Virtual Assistants), Agentic AI Systems, Multimodal AI Avatars, Neuro-symbolic AI Reasoning'),
    confirmedTechStack: splitField('Eva Platform, Neuro-symbolic AI, Knowledge Graphs, Planning-based Dialogue Engines, Python, Java, JSON-LD'),
    nonSpecializedTechStack: splitField('Industrial OT Security, Mechanical Engineering, Network Infrastructure, Traditional Web Design (Non-AI)'),
    sampleProjects: splitField('Hallucination-free Dialogue Systems for Enterprise, Multimodal AI Agents, In-car Multimodal Assistants'),
    certifications: splitField('Gartner Magic Quadrant Visionary, SOC 2'),
    partners: splitField('Microsoft, AWS, Google Cloud, Tetrasoft'),
    companySize: '51-200 employees',
    sources: ['https://openstream.ai/', 'Gartner', 'LinkedIn'],
    focusArea: 'Cybersecurity / Cloud',
    agreementStatus: 'Association Agreement',
    agreementDocuments: 'Both Available',
    contactPerson: 'Raj',
    emails: ['raj@openstream.ai', 'Tmalladi@tetrasoftfederal.us'],
  },
  {
    id: 'vendor-9',
    companyName: 'Commedia Solutions',
    primaryIndustries: splitField('Digital Media & Broadcasting, Telecommunications, Enterprise IT, Government, Education'),
    confirmedServices: splitField('Managed Services for Broadcast, Big Data Analytics, Playout Management, Network Infrastructure, SD-WAN, Cloud Solutions'),
    confirmedTechStack: splitField('Cisco, Juniper, Dell, HPE, Hadoop, Spark, AWS, Azure, jQuery, Playout Systems, Firewalls, VPNs'),
    nonSpecializedTechStack: splitField('Advanced Generative AI (LLM Training), Industrial OT Security, Medical Device Engineering, Consumer Mobile App Development'),
    sampleProjects: splitField('Playout Management for Broadcast, Big Data Analysis for Enterprise, SD-WAN Implementation for Multi-site Enterprises'),
    certifications: ['ISO 9001'],
    partners: splitField('Cisco, Dell, HPE, Avaya, Ruckus, Sonicwall'),
    companySize: '119 employees (as of 2025)',
    sources: ['https://www.commediaindia.com/', 'LinkedIn', 'Tracxn'],
    focusArea: 'AI / Data Services',
    agreementStatus: 'Pending',
    agreementDocuments: 'Resolving comments',
    contactPerson: 'Harshad',
    emails: ['harshad.awasare@commediaindia.com', 'alekh.sk@commediaindia.com', 'raghava@commediaindia.com'],
  },
  {
    id: 'vendor-10',
    companyName: 'UST (UST Global)',
    primaryIndustries: splitField('Healthcare & Life Sciences, Retail & Manufacturing, BFSI & Technology, Energy & Utilities, Public Sector'),
    confirmedServices: splitField('Digital Transformation, AI/ML Platforms (Agentic AI Factory), Managed Security Services (MDR, XDR), Cloud Engineering'),
    confirmedTechStack: splitField('Microsoft Sentinel, Splunk, CrowdStrike, Azure, AWS, GCP, GenAI Frameworks, Java, .NET, Snowflake, Databricks'),
    nonSpecializedTechStack: splitField('Industrial OT/ICS Security (Niche), Mechanical Product Design, Hardware Silicon Manufacturing, Legacy Mainframe Maintenance'),
    sampleProjects: splitField('Cybersecurity Transformation for Global Energy Co, Managed XDR for Large Bank, Agentic AI Factory Deployment'),
    certifications: splitField('CMMI Level 5, ISO 27001, Great Place to Work'),
    partners: splitField('Microsoft, AWS, Google, Salesforce, SAP, Oracle'),
    companySize: '30,000+ employees',
    sources: ['https://www.ust.com/', 'LinkedIn', 'Wikipedia'],
    focusArea: 'IT Consulting / AI',
    agreementStatus: 'Pending',
    agreementDocuments: 'Resolving comments',
    contactPerson: 'Shrikant',
    emails: ['shrikant.kulkarni@ust.com', 'dileep.sivanpillai@ust.com', 'jaison.jsebastian@ust.com'],
  },
  {
    id: 'vendor-11',
    companyName: 'SIS Industrial Cyber Security',
    primaryIndustries: splitField('Critical Infrastructure, Oil & Gas, Power & Utilities, Manufacturing (OT), Water & Wastewater'),
    confirmedServices: splitField('Industrial Cyber Security (OT/ICS), Assurance Testing, Risk Management, Incident Response for OT, Compliance Support'),
    confirmedTechStack: splitField('Modbus, DNP3, BACnet, PROFINET, IEC 62443, NIST SP 800-82, Zero Trust for OT, AI-powered Anomaly Detection'),
    nonSpecializedTechStack: splitField('Consumer Mobile App Development, Creative Media Content, Retail E-commerce, General Enterprise IT (ERP/CRM)'),
    sampleProjects: splitField('Industrial Cyber Security Roadmap for Critical Infra, OT Security Assessments for Global Energy, Zero Trust for OT'),
    certifications: splitField('IEC 62443, NIST, ISO 27001'),
    partners: splitField('Siemens, Schneider Electric, Rockwell Automation, Nozomi Networks'),
    companySize: '11-50 employees',
    sources: ['https://sis-ics.com/', 'LinkedIn', 'ZoomInfo'],
    focusArea: 'AI / ML Solutions',
    agreementStatus: 'NDA',
    agreementDocuments: 'Available',
    contactPerson: 'Mahmed',
    emails: ['mahmed@sis-ics.com', 'wgamali@sis-ics.com'],
  },
  {
    id: 'vendor-12',
    companyName: 'Blaize',
    primaryIndustries: splitField('Automotive & Mobility, Smart Retail, Industrial AI, Healthcare & Security, Smart Cities'),
    confirmedServices: splitField('Edge AI Computing Solutions, AI Software Development (AI Studio), Real-time Threat Detection, Silicon & Software Optimization'),
    confirmedTechStack: splitField('Blaize GSP (Graph Streaming Processor), Blaize AI Studio, Blaize Picasso SDK, ONNX, TensorFlow, PyTorch, PCIe'),
    nonSpecializedTechStack: splitField('General Enterprise IT (ERP/CRM), Cloud-only SaaS Applications, Traditional Cybersecurity, Consumer Web Development'),
    sampleProjects: splitField('Retail Security Application Workflow, Edge AI for Automotive Situational Awareness, Multi-modal AI for Smart City'),
    certifications: splitField('ISO 9001, ISO 26262 (Automotive Safety)'),
    partners: splitField('Automotive OEMs, Smart City Providers, NVIDIA (Competitor/Partner)'),
    companySize: '201-500 employees',
    sources: ['https://www.blaize.com/', 'LinkedIn', 'Tracxn'],
    focusArea: 'Cybersecurity / AI',
    agreementStatus: 'Association Agreement',
    agreementDocuments: 'Available',
    contactPerson: 'Kaushik',
    emails: ['Kaushik.siddharthan@blaize.com', 'dmitry.zakharchenko@blaize.com', 'ambar.dalvi@blaize.com'],
  },
  {
    id: 'vendor-13',
    companyName: 'Experion Technologies',
    primaryIndustries: splitField('Healthcare & EdTech, Retail & Logistics, BFSI, Transport & Mobility, Manufacturing'),
    confirmedServices: splitField('Product Engineering, Digital Transformation, Cloud Engineering, Data & AI Services, UI/UX Design, Mobile App Development'),
    confirmedTechStack: splitField('React, Angular, Node.js, Python, .NET, Java, Flutter, AWS, Azure, GCP, Computer Vision, NLP, GenAI'),
    nonSpecializedTechStack: splitField('Industrial OT Security, Mechanical Engineering, Hardware Silicon Design, Aerospace Engineering'),
    sampleProjects: splitField('AI Document Processing for Donor Records, Intelligent Transportation System (V2X), Healthcare Data Integration Platform'),
    certifications: splitField('ISO 27001, ISO 9001, Great Place to Work'),
    partners: splitField('Microsoft (Gold Partner), AWS, Google Cloud'),
    companySize: '1,000-5,000 employees',
    sources: ['https://experionglobal.com/', 'LinkedIn', 'Clutch'],
    focusArea: 'IT & AI Services',
    agreementStatus: 'Pending',
    agreementDocuments: 'Resolving comments',
    contactPerson: 'Ajish',
    emails: ['ajish.j@experionglobal.com', 'demis.john@experionglobal.com', 'manoj.varma@experionglobal.com'],
  },
  {
    id: 'vendor-14',
    companyName: 'Hontrel Technologies',
    primaryIndustries: splitField('Water Treatment, Marine, Oil & Gas, Building & Construction, Automobile & Aviation, Manufacturing, Semiconductor'),
    confirmedServices: splitField('AI-Powered Digital Engineering, Product Lifecycle Management (PLM), Master Data Management (MDM), Engineering Services'),
    confirmedTechStack: splitField('IEHUB.AI, Golang, Node.js, REST APIs, GenAI, LLMs, NLP, Computer Vision, Azure, AWS, Docker, Kubernetes'),
    nonSpecializedTechStack: splitField('Frontend: ReactJS, Angular (standard), Backend: Python (Django/Flask), Databases: MySQL, MongoDB'),
    sampleProjects: splitField('IEHUB.AI: AI-native Engineering Management, CPQ App for Smarter Sales, Intelligent PLM System'),
    certifications: ['Startup (Compliance in progress)'],
    partners: splitField('Engineering Firms, Manufacturing OEMs'),
    companySize: '11-50 employees',
    sources: ['https://hontrel.com/', 'LinkedIn', 'ZaubaCorp'],
    focusArea: 'AI / Engineering',
    agreementStatus: '',
    agreementDocuments: '',
    contactPerson: '',
    emails: [],
  },
  {
    id: 'vendor-15',
    companyName: 'Tetrasoft Federal',
    primaryIndustries: splitField('US Federal Agencies, Digital Transformation, Data Science, DevOps'),
    confirmedServices: splitField('Digital Services, Innovation, Data Science, DevOps, Hadoop, Big Data Analytics'),
    confirmedTechStack: splitField('Hadoop, Big Data Frameworks, DevOps Tools, Cloud Infrastructure'),
    nonSpecializedTechStack: splitField('Consumer Mobile Apps, Retail E-commerce'),
    sampleProjects: splitField('Digital Transformation for Federal Agencies, Big Data Analytics Solutions'),
    certifications: splitField('ISO 9001, ISO 27001, CMMI Level 3'),
    partners: splitField('OpenStream.ai, US Federal Agencies'),
    companySize: '501-1,000 employees (Tetrasoft Inc.)',
    sources: ['https://www.tetrasoftfederal.us/', 'LinkedIn'],
    focusArea: 'Cybersecurity / Cloud',
    agreementStatus: 'Association Agreement',
    agreementDocuments: 'Both Available',
    contactPerson: 'Raj',
    emails: ['raj@openstream.ai', 'Tmalladi@tetrasoftfederal.us'],
  },
  {
    id: 'vendor-16',
    companyName: 'Gladius & Schild',
    primaryIndustries: splitField('Cybersecurity, Information Security, Corporate Training'),
    confirmedServices: splitField('Comprehensive Cybersecurity Solutions, ISO 27001 Consulting, SOC 2 Compliance, Corporate Cyber Training'),
    confirmedTechStack: splitField('Security Assessment Tools, Compliance Frameworks, Threat Detection Systems'),
    nonSpecializedTechStack: splitField('General Software Development, AI Model Training'),
    sampleProjects: splitField('Corporate Cyber Security Training for TuxCentrix, ISO 27001 Certification Delivery'),
    certifications: splitField('ISO 27001:2022, SOC 2'),
    partners: splitField('YAS Calicut Chapter, Tech Partners in Cybersecurity'),
    companySize: '11-50 employees',
    sources: ['https://gladiusschild.com/', 'LinkedIn'],
    focusArea: 'Cybersecurity Solutions',
    agreementStatus: 'NDA',
    agreementDocuments: 'Available',
    contactPerson: 'Nooja',
    emails: ['nooja.shimmy@gladiusschild.com', 'akshay.p@gladiusschild.com', 'abin.joy@gladiusschild.com'],
  },
];

// Vendor state management via localStorage
const STORAGE_KEY = 'vendors_data';

export function getVendors(): VendorData[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_VENDORS;
    }
  }
  // Initialize with embedded data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VENDORS));
  return INITIAL_VENDORS;
}

export function saveVendors(vendors: VendorData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}

export function addVendor(vendor: Omit<VendorData, 'id'>): VendorData {
  const vendors = getVendors();
  const newVendor: VendorData = { ...vendor, id: `vendor-${Date.now()}` };
  vendors.push(newVendor);
  saveVendors(vendors);
  return newVendor;
}

export function updateVendor(id: string, updates: Partial<VendorData>) {
  const vendors = getVendors();
  const idx = vendors.findIndex(v => v.id === id);
  if (idx !== -1) {
    vendors[idx] = { ...vendors[idx], ...updates };
    saveVendors(vendors);
  }
}

export function deleteVendor(id: string) {
  const vendors = getVendors().filter(v => v.id !== id);
  saveVendors(vendors);
}

// Get all searchable fields as individual items for relevance scoring
function getSearchableFields(v: VendorData): string[] {
  return [
    v.companyName,
    v.companySize,
    v.focusArea,
    v.agreementStatus,
    v.agreementDocuments,
    v.contactPerson,
    ...v.primaryIndustries,
    ...v.confirmedServices,
    ...v.confirmedTechStack,
    ...v.nonSpecializedTechStack,
    ...v.sampleProjects,
    ...v.certifications,
    ...v.partners,
    ...v.sources,
    ...v.emails,
  ].filter(Boolean);
}

// Character-level search: every single character/substring in the query is matched
export function searchVendors(vendors: VendorData[], query: string): VendorData[] {
  if (!query.trim()) return vendors;
  const q = query.toLowerCase().trim();

  return vendors.filter(v => {
    const searchable = getSearchableFields(v).join(' ').toLowerCase();
    // Match every term (space-separated), each term matched as substring
    return q.split(/\s+/).filter(Boolean).every(term => searchable.includes(term));
  });
}

// Returns the number of individual fields that match any search term
export function getVendorMatchCount(vendor: VendorData, query: string): number {
  if (!query.trim()) return 0;
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const fields = getSearchableFields(vendor);
  let matches = 0;
  fields.forEach(field => {
    const lower = field.toLowerCase();
    if (terms.some(term => lower.includes(term))) {
      matches++;
    }
  });
  return matches;
}
