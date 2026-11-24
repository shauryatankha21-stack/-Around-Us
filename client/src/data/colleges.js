// Curated list of popular Indian and international universities/colleges
// Users can always type a custom name if their college is not listed.

export const POPULAR_COLLEGES = [
  // Manipal Campuses & Affiliates
  'Manipal Institute of Technology (MIT), Manipal',
  'Manipal Academy of Higher Education (MAHE), Manipal',
  'Manipal University Jaipur (MUJ)',
  'Sikkim Manipal Institute of Technology (SMIT), Sikkim',
  'Manipal Academy of Higher Education, Bengaluru',
  'Kasturba Medical College (KMC), Manipal',
  'Kasturba Medical College (KMC), Mangalore',
  'T. A. Pai Management Institute (TAPMI), Manipal',
  'Manipal College of Dental Sciences, Manipal',

  // IITs
  'IIT Delhi (Indian Institute of Technology Delhi)',
  'IIT Bombay (Indian Institute of Technology Bombay)',
  'IIT Madras (Indian Institute of Technology Madras)',
  'IIT Kanpur (Indian Institute of Technology Kanpur)',
  'IIT Kharagpur (Indian Institute of Technology Kharagpur)',
  'IIT Roorkee (Indian Institute of Technology Roorkee)',
  'IIT Guwahati (Indian Institute of Technology Guwahati)',
  'IIT Hyderabad (Indian Institute of Technology Hyderabad)',
  'IIT BHU (Varanasi)',
  'IIT Indore',
  'IIT Gandhinagar',
  'IIT Jodhpur',
  'IIT Patna',
  'IIT Bhubaneswar',
  'IIT Ropar',
  'IIT Mandi',
  'IIT Tirupati',
  'IIT Palakkad',
  'IIT Goa',
  'IIT Dharwad',
  'IIT Jammu',

  // BITS Pilani
  'BITS Pilani (Pilani Campus)',
  'BITS Pilani (Goa Campus)',
  'BITS Pilani (Hyderabad Campus)',

  // NITs
  'NIT Trichy (National Institute of Technology Tiruchirappalli)',
  'NIT Surathkal (NITK)',
  'NIT Warangal',
  'NIT Rourkela',
  'NIT Calicut',
  'NIT Durgapur',
  'NIT Kurukshetra',
  'NIT Silchar',
  'NIT Hamirpur',
  'VNIT Nagpur',
  'SVNIT Surat',
  'MNIT Jaipur',
  'MNNIT Allahabad',
  'MANIT Bhopal',

  // Delhi & NCR Tech & Universities
  'DTU (Delhi Technological University)',
  'NSUT (Netaji Subhas University of Technology), Delhi',
  'IIIT Delhi (Indraprastha Institute of Information Technology)',
  'IGDTUW (Indira Gandhi Delhi Technical University for Women)',
  'Jamia Millia Islamia, New Delhi',
  'Jawaharlal Nehru University (JNU), New Delhi',
  'BML Munjal University, Gurugram',
  'Amity University, Noida',
  'Amity University, Gurugram',
  'Shiv Nadar University, Greater Noida',
  'Ashoka University, Sonipat',
  'OP Jindal Global University, Sonipat',

  // IIITs
  'IIIT Hyderabad',
  'IIIT Bangalore',
  'IIIT Allahabad',
  'IIIT Gwalior',
  'IIIT Jabalpur',

  // Private Tech Universities
  'VIT (Vellore Institute of Technology), Vellore',
  'VIT Chennai',
  'VIT Bhopal',
  'VIT AP',
  'SRM Institute of Science and Technology, Kattankulathur',
  'SRM Institute of Science and Technology, Ramapuram',
  'SRM University, AP',
  'Thapar Institute of Engineering and Technology, Patiala',
  'Chandigarh University',
  'Lovely Professional University (LPU), Phagwara',
  'PES University, Bengaluru',
  'RV College of Engineering (RVCE), Bengaluru',
  'BMS College of Engineering, Bengaluru',
  'MS Ramaiah Institute of Technology (MSRIT), Bengaluru',

  // Bengaluru & South Universities
  'Christ University, Bengaluru (Central Campus)',
  'Christ University, Bengaluru (Bannerghatta)',
  'Christ University, Bengaluru (Kengeri)',
  'Christ University, Delhi NCR',
  'Anna University, Chennai',
  'College of Engineering, Guindy (CEG), Chennai',
  'Loyola College, Chennai',
  'PSG College of Technology, Coimbatore',
  'National Law School of India University (NLSIU), Bengaluru',

  // Delhi University (DU)
  'St. Stephen\'s College, Delhi University',
  'Shri Ram College of Commerce (SRCC), Delhi University',
  'Hindu College, Delhi University',
  'Hansraj College, Delhi University',
  'Miranda House, Delhi University',
  'Lady Shri Ram College (LSR), Delhi University',
  'Kirori Mal College (KMC), Delhi University',
  'Ramjas College, Delhi University',
  'Sri Venkateswara College, Delhi University',
  'Shaheed Bhagat Singh College, Delhi University',
  'Gargi College, Delhi University',
  'Atma Ram Sanatan Dharma College (ARSD), Delhi University',
  'Faculty of Management Studies (FMS), Delhi University',

  // Mumbai & Pune
  'St. Xavier\'s College, Mumbai',
  'NMIMS Mumbai (Narsee Monjee)',
  'NMIMS Bengaluru',
  'Symbiosis International University, Pune',
  'Symbiosis Institute of Technology (SIT), Pune',
  'College of Engineering Pune (COEP)',
  'Veermata Jijabai Technological Institute (VJTI), Mumbai',
  'SPJIMR Mumbai',

  // Kolkata & East
  'St. Xavier\'s College, Kolkata',
  'Jadavpur University, Kolkata',
  'Calcutta University, Kolkata',
  'Presidency University, Kolkata',
  'The West Bengal National University of Juridical Sciences (WBNUJS), Kolkata',

  // Other Leading Institutions
  'Banaras Hindu University (BHU), Varanasi',
  'Aligarh Muslim University (AMU), Aligarh',
  'AIIMS New Delhi',
  'AIIMS Jodhpur',
  'AIIMS Rishikesh',
  'AIIMS Bhopal',
  'King George\'s Medical University (KGMU), Lucknow',
  'CMC Vellore (Christian Medical College)',
  'IIM Ahmedabad',
  'IIM Bangalore',
  'IIM Calcutta',
  'IIM Lucknow',
  'IIM Kozhikode',
  'IIM Indore',
  'XLRI Jamshedpur',

  // Notable International
  'Harvard University',
  'Stanford University',
  'Massachusetts Institute of Technology (MIT)',
  'University of Oxford',
  'University of Cambridge',
  'University of California, Berkeley (UC Berkeley)',
  'Columbia University',
  'New York University (NYU)',
  'University of Toronto',
  'National University of Singapore (NUS)',
];

/**
 * Filter college suggestions based on query text
 * @param {string} query
 * @param {number} limit
 * @returns {string[]}
 */
export function getCollegeSuggestions(query = '', limit = 8) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Split query into terms for multi-word matching
  const searchTerms = cleanQuery.split(/\s+/).filter(Boolean);

  const matched = POPULAR_COLLEGES.filter((college) => {
    const lower = college.toLowerCase();
    // Every search term should match somewhere in the college name
    return searchTerms.every((term) => lower.includes(term));
  });

  // Sort: exact start matches first, then contains
  matched.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aStarts = aLower.startsWith(cleanQuery);
    const bStarts = bLower.startsWith(cleanQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.localeCompare(b);
  });

  return matched.slice(0, limit);
}
