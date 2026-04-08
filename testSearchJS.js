const TYPOS_MAP = {
  pelamadu: 'peelamedu',
  peelamdu: 'peelamedu',
  saravanampati: 'saravanampatti',
  kovai: 'coimbatore',
  madras: 'chennai',
  vada: 'vada valli',
  thudiyalur: 'thudiyalur'
};

const LOCATIONS = ['coimbatore', 'peelamedu', 'saravanampatti', 'rs puram', 'gandhipuram', 'kavundampalayam', 'vada valli', 'singanallur', 'kuniamuthur', 'thudiyalur', 'tiruppur', 'chennai', 'madurai'];

function resolveTypo(txt) {
  let cleaned = txt;
  Object.keys(TYPOS_MAP).forEach(t => {
      if (cleaned.includes(t)) cleaned = cleaned.replace(t, TYPOS_MAP[t]);
  });
  return cleaned;
}

const parseSearch = (query) => {
  let q = query.toLowerCase();
  q = resolveTypo(q);
  
  const intent = {};

  const exclude = {};
  if (q.includes('no pg') || q.includes('not pg')) exclude.propertyType = 'pg';
  if (q.includes('no sharing')) exclude.sharing = true;
  if (q.includes('not for bachelors') || q.includes('no bachelors') || q.includes('family only')) {
     intent.bachelorAllowed = false;
  }
  if (Object.keys(exclude).length > 0) intent.exclude = exclude;

  let foundLocs = [];
  LOCATIONS.forEach(loc => {
      if (q.includes(loc)) foundLocs.push(loc);
  });
  if (foundLocs.length > 0) {
      intent.locationText = foundLocs.length === 1 ? foundLocs[0] : foundLocs;
  }
  const isNear = q.match(/\bnear\b|\baround\b|\bnearby\b|\bclose to\b|\bclosest\b|\bnearest\b/i);
  if (isNear || q.includes('within') || q.includes('with in')) {
      intent.useGeo = true;
  }
  if (q.includes('near me')) {
      intent.useGeo = true;
      delete intent.locationText; 
  }

  const landmarkMatch = q.match(/near (\w+ (college|hospital|park|airport))/i);
  if (landmarkMatch && !intent.locationText) {
      intent.nearLandmark = landmarkMatch[1];
      intent.useGeo = true;
  }

  const radMatch = q.match(/within\s*(\d+)\s*(km|kms)/i) || 
                   q.match(/with\s*in\s*(\d+)\s*(km|kms)/i) ||
                   q.match(/(\d+)\s*(km|kms)/i);
  if (radMatch) intent.radius = parseInt(radMatch[1]);

  const approxMatch = q.match(/around (\d+k?)/i) || q.match(/approx (\d+k?)/i);
  if (approxMatch) {
      let val = parseK(approxMatch[1]);
      intent.minPrice = Math.max(0, val - 1000);
      intent.maxPrice = val + 1000;
  } else {
      const minMatch = q.match(/(above|minimum|min)\s*(\d+k?)/i);
      if (minMatch) intent.minPrice = parseK(minMatch[2]);
      
      const maxMatch = q.match(/(under|below|less than|max)\s*(\d+k?)/i);
      if (maxMatch) intent.maxPrice = parseK(maxMatch[2]);
      
      const rangeMatch = q.match(/(\d+k?)\s*to\s*(\d+k?)/i);
      if (rangeMatch) {
          intent.minPrice = parseK(rangeMatch[1]);
          intent.maxPrice = parseK(rangeMatch[2]);
      }
  }
  
  if (q.match(/\bcheap\b|\bbudget\b|\blow budget\b/)) intent.priceCategory = 'low';
  if (q.match(/\bluxury\b|\bpremium\b|\bhigh end\b/)) intent.priceCategory = 'high';

  let pTypes = [];
  if (q.includes('pg') || q.includes('hostel')) pTypes.push('pg');
  if (q.includes('apartment') || q.includes('flat')) pTypes.push('apartment');
  if (q.includes('house') || q.includes('villa')) pTypes.push('apartment'); 
  if (q.includes('room') && pTypes.length === 0) pTypes.push('pg'); 
  if (pTypes.length > 0) intent.propertyType = pTypes.length === 1 ? pTypes[0] : pTypes;

  const bhkMatch = q.match(/(\d)\s*bhk/i);
  if (bhkMatch) intent.bhkType = `${bhkMatch[1]}BHK`;

  if (q.match(/\bboys\b|\bmens\b|\bmen\b/)) intent.gender = 'boys';
  if (q.match(/\bgirls\b|\bladies\b|\bwomens\b|\bwomen\b/)) intent.gender = 'girls';

  const shareMatches = [...q.matchAll(/(\d)\s*(?:or)?\s*(\d)?\s*sharing/gi)];
  if (shareMatches.length > 0) {
      let shares = [];
      for(let m of shareMatches) {
          if (m[1]) shares.push(parseInt(m[1]));
          if (m[2]) shares.push(parseInt(m[2]));
      }
      intent.sharing = shares.length === 1 ? shares[0] : shares;
  }
  if (q.includes('single sharing')) intent.sharing = 1;
  if (q.includes('double sharing')) intent.sharing = 2;
  if (q.includes('triple sharing')) intent.sharing = 3;

  if (q.includes('beds available') || q.includes('vacancy') || q.includes('available beds')) {
      intent.availableBeds = true;
  }

  if (q.includes('bachelor allowed') || q.includes('bachelor')) intent.bachelorAllowed = true;

  if (q.includes('fully furnished')) intent.furnishing = 'full';
  else if (q.includes('semi furnished')) intent.furnishing = 'semi';
  else if (q.includes('unfurnished')) intent.furnishing = 'none';

  if (q.match(/ready to move|available now|immediate(\s|ly)?/i)) intent.available = true;
  if (q.match(/next month|from (june|july|aug|sep|oct|nov|dec|jan|feb|mar|apr|may)/i)) intent.availabilityDate = 'future';

  let amens = [];
  if (q.includes('wifi')) amens.push('wifi');
  if (q.includes('parking')) amens.push('parking');
  if (q.match(/ac\b|\bac room/)) amens.push('ac');
  if (q.match(/attached bathroom|attached bath/)) amens.push('attached_bathroom');
  if (amens.length > 0) intent.amenities = amens;

  if (q.match(/cheap first|lowest price|cheap/)) intent.sort = 'price_low';
  if (q.match(/closest|nearest|walking distance/)) {
      intent.sort = 'nearest';
      if (!intent.radius) intent.radius = 2; 
  }
  if (q.includes('latest')) intent.sort = 'latest';

  const rmMatch = q.match(/(\d)\s*(room|bedroom)/i);
  if (rmMatch) intent.roomCount = parseInt(rmMatch[1]);
  if (q.includes('single room')) intent.roomCount = 1;

  const occMatch = q.match(/for (\d) (people|members)/i);
  if (occMatch) intent.requiredCapacity = parseInt(occMatch[1]);

  if (q.includes('strict owner')) intent.ownerPreference = 'strict';
  if (q.includes('flexible') || q.includes('no restrictions') || q.includes('friendly')) intent.ownerPreference = 'flexible';

  if (q.match(/verified|trusted|no fake/)) intent.isVerified = true;

  if (q.match(/same as before|similar|more like this/)) intent.basedOnPrevious = true;

  if (q.match(/show saved|wishlist/)) intent.wishlistOnly = true;

  if (Object.keys(intent).length === 0) {
      intent.useGeo = true;
      intent.radius = 5;
      intent.sort = 'relevance';
  }

  return intent;
};

// Utils
function parseK(str) {
    let raw = parseInt(str);
    if (str.toLowerCase().includes('k')) return raw * 1000;
    if (raw < 100 && raw > 0) return raw * 1000; 
    return raw;
}

console.log(parseSearch("boys pg near peelamedu under 5000"));
