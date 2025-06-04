import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(url, {
      responseType: 'text',
      headers: {
        'Accept': 'text/tab-separated-values, text/plain',
      }
    });

    const parsed = Papa.parse(response.data, {
      header: true,
      delimiter: '\t',
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn('Parsing errors:', parsed.errors);
    }

    const countryData: { [key: string]: any[] } = {};
    
    parsed.data.forEach((row: any) => {
      const country = row.geoLocCountry || 'Unknown';
      if (!countryData[country]) {
        countryData[country] = [];
      }
      countryData[country].push(row);
    });

    const countrySummary = Object.entries(countryData).map(([country, entries]) => ({
      country,
      count: entries.length,
      data: entries
    }));

    return NextResponse.json({ 
      success: true, 
      data: parsed.data,
      countrySummary,
      totalCount: parsed.data.length
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch or parse data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}