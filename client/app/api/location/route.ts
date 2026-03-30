import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ success: false, error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    const mapplsKey = process.env.NEXT_PUBLIC_MAPPLS_API || '';
    
    if (!mapplsKey) {
        throw new Error("Mappls API key is missing from environment variables.");
    }

    // Call Mappls API from the secure Next.js Server backend!
    const response = await fetch(`https://apis.mappls.com/advancedmaps/v1/${mapplsKey}/rev_geocode?lat=${lat}&lng=${lng}`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Mappls returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const locationData = data.results[0];
      const detectedLocation = locationData.subLocality || locationData.city || locationData.district;
      return NextResponse.json({ success: true, location: detectedLocation, raw: locationData });
    } else {
      return NextResponse.json({ success: false, error: 'No location found at these coordinates' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('SERVER SIDE Mappls API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
