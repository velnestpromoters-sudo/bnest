const TYPOS_MAP = {};
const LOCATIONS = ['coimbatore'];

function resolveTypo(txt) { return txt; }

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
      // DONT INCLUDE PARSE K LOGIC FOR NOW, ASSUME SAFE
  } else {
      const minMatch = q.match(/(above|minimum|min)\s*(\d+k?)/i);
      
      const maxMatch = q.match(/(under|below|less than|max)\s*(\d+k?)/i);
      
      const rangeMatch = q.match(/(\d+k?)\s*to\s*(\d+k?)/i);
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

  return intent;
};

try {
  console.log(parseSearch('bhk'));
  console.log(parseSearch('5'));
  console.log(parseSearch('b'));
  console.log("Success");
} catch(e) {
  console.log("Error:", e);
}
