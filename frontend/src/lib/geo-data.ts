// Comprehensive Geolocation Dataset for World Countries, Phone Dial Codes, States & Cities
export interface CountryData {
  name: string;
  code: string; // ISO 2-letter
  dialCode: string;
  flag: string;
  currency: string;
  states: {
    name: string;
    code?: string;
    cities: string[];
  }[];
}

export const COUNTRIES_DATA: CountryData[] = [
  {
    name: 'India',
    code: 'IN',
    dialCode: '+91',
    flag: '🇮🇳',
    currency: 'USD',
    states: [
      {
        name: 'Maharashtra',
        code: 'MH',
        cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Aurangabad', 'Solapur'],
      },
      {
        name: 'Delhi NCR',
        code: 'DL',
        cities: ['New Delhi', 'North Delhi', 'South Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'],
      },
      {
        name: 'Karnataka',
        code: 'KA',
        cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Ballari'],
      },
      {
        name: 'Gujarat',
        code: 'GJ',
        cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar', 'Jamnagar'],
      },
      {
        name: 'Tamil Nadu',
        code: 'TN',
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
      },
      {
        name: 'Telangana',
        code: 'TG',
        cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
      },
      {
        name: 'Uttar Pradesh',
        code: 'UP',
        cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Noida'],
      },
      {
        name: 'West Bengal',
        code: 'WB',
        cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
      },
      {
        name: 'Rajasthan',
        code: 'RJ',
        cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'],
      },
      {
        name: 'Punjab & Haryana',
        code: 'PB',
        cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Gurgaon', 'Panchkula'],
      },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    currency: 'USD',
    states: [
      {
        name: 'California',
        code: 'CA',
        cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Irvine'],
      },
      {
        name: 'New York',
        code: 'NY',
        cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'Brooklyn', 'Manhattan'],
      },
      {
        name: 'Texas',
        code: 'TX',
        cities: ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington'],
      },
      {
        name: 'Florida',
        code: 'FL',
        cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'St. Petersburg'],
      },
      {
        name: 'Illinois',
        code: 'IL',
        cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield'],
      },
      {
        name: 'Washington',
        code: 'WA',
        cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Everett'],
      },
      {
        name: 'Georgia',
        code: 'GA',
        cities: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens'],
      },
      {
        name: 'Pennsylvania',
        code: 'PA',
        cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'],
      },
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪',
    currency: 'USD',
    states: [
      {
        name: 'Dubai',
        code: 'DXB',
        cities: ['Downtown Dubai', 'Business Bay', 'Dubai Marina', 'DIFC', 'JLT', 'Deira', 'Palm Jumeirah', 'IFZA DDP'],
      },
      {
        name: 'Abu Dhabi',
        code: 'AUH',
        cities: ['Abu Dhabi City', 'Al Ain', 'Al Dhafra', 'Yas Island', 'Saadiyat Island', 'Khalifa City'],
      },
      {
        name: 'Sharjah',
        code: 'SHJ',
        cities: ['Sharjah City', 'Khor Fakkan', 'Kalba', 'Al Dhaid'],
      },
      {
        name: 'Ajman & Northern Emirates',
        code: 'AJM',
        cities: ['Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
      },
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    dialCode: '+44',
    flag: '🇬🇧',
    currency: 'USD',
    states: [
      {
        name: 'Greater London',
        code: 'LON',
        cities: ['Central London', 'City of London', 'Westminster', 'Canary Wharf', 'Camden', 'Kensington'],
      },
      {
        name: 'Greater Manchester',
        code: 'MAN',
        cities: ['Manchester', 'Salford', 'Bolton', 'Stockport', 'Oldham', 'Rochdale'],
      },
      {
        name: 'West Midlands',
        code: 'WM',
        cities: ['Birmingham', 'Coventry', 'Wolverhampton', 'Solihull', 'Dudley'],
      },
      {
        name: 'West Yorkshire',
        code: 'WY',
        cities: ['Leeds', 'Bradford', 'Wakefield', 'Huddersfield', 'Halifax'],
      },
      {
        name: 'Scotland',
        code: 'SCT',
        cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'],
      },
      {
        name: 'Wales & Northern Ireland',
        code: 'WLS',
        cities: ['Cardiff', 'Swansea', 'Belfast', 'Newport', 'Londonderry'],
      },
    ],
  },
  {
    name: 'Germany',
    code: 'DE',
    dialCode: '+49',
    flag: '🇩🇪',
    currency: 'USD',
    states: [
      {
        name: 'Bavaria (Bayern)',
        code: 'BY',
        cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Würzburg'],
      },
      {
        name: 'Berlin',
        code: 'BE',
        cities: ['Berlin Mitte', 'Charlottenburg', 'Kreuzberg', 'Pankow', 'Neukölln'],
      },
      {
        name: 'Hesse (Hessen)',
        code: 'HE',
        cities: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach'],
      },
      {
        name: 'North Rhine-Westphalia (NRW)',
        code: 'NW',
        cities: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn', 'Münster'],
      },
      {
        name: 'Baden-Württemberg',
        code: 'BW',
        cities: ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heidelberg'],
      },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    dialCode: '+1',
    flag: '🇨🇦',
    currency: 'USD',
    states: [
      {
        name: 'Ontario',
        code: 'ON',
        cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham'],
      },
      {
        name: 'British Columbia',
        code: 'BC',
        cities: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Kelowna'],
      },
      {
        name: 'Quebec',
        code: 'QC',
        cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
      },
      {
        name: 'Alberta',
        code: 'AB',
        cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert'],
      },
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    dialCode: '+61',
    flag: '🇦🇺',
    currency: 'USD',
    states: [
      {
        name: 'New South Wales',
        code: 'NSW',
        cities: ['Sydney', 'Newcastle', 'Central Coast', 'Wollongong', 'Parramatta'],
      },
      {
        name: 'Victoria',
        code: 'VIC',
        cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'],
      },
      {
        name: 'Queensland',
        code: 'QLD',
        cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
      },
      {
        name: 'Western Australia',
        code: 'WA',
        cities: ['Perth', 'Mandurah', 'Bunbury', 'Fremantle'],
      },
    ],
  },
  {
    name: 'Singapore',
    code: 'SG',
    dialCode: '+65',
    flag: '🇸🇬',
    currency: 'USD',
    states: [
      {
        name: 'Central Region',
        code: 'CR',
        cities: ['Downtown Core', 'Marina Bay', 'Orchard', 'Novena', 'Bukit Merah'],
      },
      {
        name: 'East & West Region',
        code: 'EWR',
        cities: ['Jurong East', 'Clementi', 'Tampines', 'Bedok', 'Changi'],
      },
    ],
  },
  {
    name: 'France',
    code: 'FR',
    dialCode: '+33',
    flag: '🇫🇷',
    currency: 'USD',
    states: [
      {
        name: 'Île-de-France',
        code: 'IDF',
        cities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Montreuil'],
      },
      {
        name: 'Auvergne-Rhône-Alpes',
        code: 'ARA',
        cities: ['Lyon', 'Saint-Étienne', 'Grenoble', 'Villeurbanne', 'Clermont-Ferrand'],
      },
      {
        name: 'Provence-Alpes-Côte d\'Azur',
        code: 'PACA',
        cities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Cannes', 'Antibes'],
      },
    ],
  },
  {
    name: 'Netherlands',
    code: 'NL',
    dialCode: '+31',
    flag: '🇳🇱',
    currency: 'USD',
    states: [
      {
        name: 'North Holland',
        code: 'NH',
        cities: ['Amsterdam', 'Haarlem', 'Zaanstad', 'Alkmaar', 'Hilversum'],
      },
      {
        name: 'South Holland',
        code: 'ZH',
        cities: ['Rotterdam', 'The Hague', 'Leiden', 'Dordrecht', 'Delft'],
      },
      {
        name: 'Utrecht',
        code: 'UT',
        cities: ['Utrecht', 'Amersfoort', 'Veenendaal', 'Zeist'],
      },
    ],
  },
  {
    name: 'Switzerland',
    code: 'CH',
    dialCode: '+41',
    flag: '🇨🇭',
    currency: 'USD',
    states: [
      {
        name: 'Zurich & Geneva',
        code: 'ZH',
        cities: ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne'],
      },
    ],
  },
  {
    name: 'Spain',
    code: 'ES',
    dialCode: '+34',
    flag: '🇪🇸',
    currency: 'USD',
    states: [
      {
        name: 'Madrid',
        code: 'MD',
        cities: ['Madrid City', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés'],
      },
      {
        name: 'Catalonia',
        code: 'CT',
        cities: ['Barcelona', 'L\'Hospitalet', 'Badalona', 'Terrassa', 'Sabadell'],
      },
      {
        name: 'Andalusia',
        code: 'AN',
        cities: ['Seville', 'Málaga', 'Córdoba', 'Granada', 'Jerez de la Frontera'],
      },
    ],
  },
  {
    name: 'Italy',
    code: 'IT',
    dialCode: '+39',
    flag: '🇮🇹',
    currency: 'USD',
    states: [
      {
        name: 'Lombardy',
        code: 'LM',
        cities: ['Milan', 'Brescia', 'Monza', 'Bergamo', 'Como'],
      },
      {
        name: 'Lazio',
        code: 'LZ',
        cities: ['Rome', 'Latina', 'Guidonia Montecelio', 'Fiumicino'],
      },
      {
        name: 'Campania & Piedmont',
        code: 'CP',
        cities: ['Naples', 'Turin', 'Salerno', 'Novara'],
      },
    ],
  },
  {
    name: 'Japan',
    code: 'JP',
    dialCode: '+81',
    flag: '🇯🇵',
    currency: 'USD',
    states: [
      {
        name: 'Kanto (Tokyo)',
        code: 'TK',
        cities: ['Tokyo', 'Yokohama', 'Kawasaki', 'Saitama', 'Chiba'],
      },
      {
        name: 'Kansai (Osaka)',
        code: 'OS',
        cities: ['Osaka', 'Kyoto', 'Kobe', 'Sakai', 'Nara'],
      },
    ],
  },
  {
    name: 'Cyprus',
    code: 'CY',
    dialCode: '+357',
    flag: '🇨🇾',
    currency: 'USD',
    states: [
      {
        name: 'Nicosia & Limassol',
        code: 'NIC',
        cities: ['Nicosia', 'Limassol', 'Strovolos', 'Larnaca', 'Paphos'],
      },
    ],
  },
  {
    name: 'South Africa',
    code: 'ZA',
    dialCode: '+27',
    flag: '🇿🇦',
    currency: 'USD',
    states: [
      {
        name: 'Gauteng & Western Cape',
        code: 'GT',
        cities: ['Johannesburg', 'Cape Town', 'Pretoria', 'Durban', 'Sandton'],
      },
    ],
  },
  {
    name: 'Brazil',
    code: 'BR',
    dialCode: '+55',
    flag: '🇧🇷',
    currency: 'USD',
    states: [
      {
        name: 'São Paulo & Rio',
        code: 'SP',
        cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte', 'Curitiba'],
      },
    ],
  },
  {
    name: 'Turkey',
    code: 'TR',
    dialCode: '+90',
    flag: '🇹🇷',
    currency: 'USD',
    states: [
      {
        name: 'Istanbul & Ankara',
        code: 'IST',
        cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
      },
    ],
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦',
    currency: 'USD',
    states: [
      {
        name: 'Riyadh & Makkah',
        code: 'RUH',
        cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
      },
    ],
  },
  {
    name: 'Malaysia',
    code: 'MY',
    dialCode: '+60',
    flag: '🇲🇾',
    currency: 'USD',
    states: [
      {
        name: 'Kuala Lumpur & Selangor',
        code: 'KUL',
        cities: ['Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'George Town', 'Johor Bahru'],
      },
    ],
  },
];

// Helper to find country by name or code
export function findCountry(query: string): CountryData | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return COUNTRIES_DATA.find(
    (c) =>
      c.name.toLowerCase() === q ||
      c.code.toLowerCase() === q ||
      c.dialCode.toLowerCase() === q ||
      c.name.toLowerCase().includes(q)
  );
}

// Preset popular demo addresses for 1-click test checkout
export const PRESET_ADDRESSES = [
  {
    id: 'in-mumbai',
    label: '🇮🇳 Mumbai, Maharashtra (India)',
    fullName: 'Garv Gautam Kataria',
    phone: '+91 98765 43210',
    addressLine1: 'B-402, High Street Heights, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India',
  },
  {
    id: 'us-california',
    label: '🇺🇸 Los Angeles, California (USA)',
    fullName: 'Alex Morgan',
    phone: '+1 213 555 0192',
    addressLine1: '742 Evergreen Terrace, Suite 100',
    city: 'Los Angeles',
    state: 'California',
    postalCode: '90001',
    country: 'United States',
  },
  {
    id: 'ae-dubai',
    label: '🇦🇪 Business Bay, Dubai (UAE)',
    fullName: 'Tariq Al-Mansoor',
    phone: '+971 50 123 4567',
    addressLine1: 'Bay View Tower, Floor 14, Business Bay',
    city: 'Dubai',
    state: 'Dubai',
    postalCode: '00000',
    country: 'United Arab Emirates',
  },
  {
    id: 'gb-london',
    label: '🇬🇧 Canary Wharf, London (UK)',
    fullName: 'James Harrison',
    phone: '+44 20 7946 0912',
    addressLine1: '25 Bank Street, Level 12',
    city: 'Greater London',
    state: 'Greater London',
    postalCode: 'E14 5JP',
    country: 'United Kingdom',
  },
];
