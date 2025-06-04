'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DataTable from '@/components/DataTable';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" />
});

export default function ClientPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [countrySummary, setCountrySummary] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      fetchData(url);
    }
  }, [searchParams]);

  const fetchData = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/fetch-data?url=${encodeURIComponent(url)}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      setData(result.data);
      setCountrySummary(result.countrySummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryClick = (country: string, countryData: any[]) => {
    setSelectedCountry(country);
    setSelectedData(countryData);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Pathoplexus Sample Map Visualization
        </h1>
        
        {!searchParams.get('url') && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
            <p className="font-bold">No URL provided</p>
            <p>Please provide a URL parameter with the data source.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && countrySummary.length > 0 && (
          <>
            <div className="bg-white p-4 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-2">Dataset Overview</h2>
              <p className="text-gray-600">
                Total samples: {data.length} | Countries: {
                  countrySummary.filter(c => 
                    c.country.toLowerCase() !== 'unknown' && 
                    c.country.toLowerCase() !== 'missing'
                  ).length
                }
              </p>
            </div>

            <MapComponent 
              countrySummary={countrySummary} 
              onCountryClick={handleCountryClick} 
            />
            
            <DataTable 
              data={selectedData} 
              selectedCountry={selectedCountry} 
            />
          </>
        )}
      </div>
    </main>
  );
}