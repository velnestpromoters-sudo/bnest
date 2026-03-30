import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!q) {
    return NextResponse.json({ success: false, error: 'Missing query' }, { status: 400 });
  }

  try {
    // Call Photon from Server side and BIAS heavily towards the user's current Map Center
    // This allows loosely spelled abbreviations like "ngp college" to match "Dr.N.G.P. Arts and Science College" because it's nearby!
    let photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8`;
    if (lat && lng) {
        photonUrl += `&lat=${lat}&lon=${lng}`;
    }

    const response = await fetch(photonUrl, {
        headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Bnest-Property-App/1.0 (Development Server)'
        }
    });

    if (!response.ok) {
        throw new Error(`Photon returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, features: data.features || [] });

  } catch (error: any) {
    console.error('SERVER SIDE POI Search Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
