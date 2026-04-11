import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng'); // Note: Mappls uses 'lng', Nominatim uses 'lon'. We map it.

  if (!lat || !lng) {
    return NextResponse.json({ success: false, error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    // Call Nominatim (OpenStreetMap's native unified API) - 100% Free, No Keys!
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Homyvo-Property-App/1.0 (Development)'
        }
    });

    if (!response.ok) {
        throw new Error(`OSM Nominatim returned status ${response.status}`);
    }

    const data = await response.json();

    if (data && data.address) {
      // Bypass non-human micro-jurisdictions like "Ward 36" by explicitly filtering out numerics when parsing the hierarchy natively
      const validName = (name: string | undefined) => (name && !name.toLowerCase().includes('ward') && !/\d/.test(name)) ? name : null;
      
      const detectedLocation = validName(data.address.suburb) 
                            || validName(data.address.village)
                            || validName(data.address.town)
                            || validName(data.address.city_district) 
                            || validName(data.address.neighbourhood)
                            || validName(data.address.city) 
                            || 'Unknown Location';

      return NextResponse.json({ success: true, location: detectedLocation, raw: data });
    } else {
      return NextResponse.json({ success: false, error: 'No precise district found' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('SERVER SIDE OSM Geocode Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
