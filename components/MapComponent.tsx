'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { scaleLinear } from 'd3-scale';
import 'leaflet/dist/leaflet.css';
import type { FeatureCollection, Feature } from 'geojson';
import type { PathOptions } from 'leaflet';

interface MapProps {
  countrySummary: Array<{
    country: string;
    count: number;
    data: any[];
  }>;
  onCountryClick: (country: string, data: any[]) => void;
}

const MapComponent: React.FC<MapProps> = ({ countrySummary, onCountryClick }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<{ country: string; count: number } | null>(null);
  const [unmappedCountries, setUnmappedCountries] = useState<string[]>([]);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  // Create color mapping
  const maxCount = Math.max(...countrySummary.map(c => c.count), 1);
  const colorScale = scaleLinear<string>()
    .domain([0, maxCount])
    .range(['#fee0d2', '#de2d26']);

  const countryMap = useMemo(() => {
    const map = new Map();
    countrySummary.forEach(c => {
      map.set(c.country.toLowerCase(), c);
    });
    return map;
  }, [countrySummary]);

  useEffect(() => {
    fetch('/custom.geo-midi.json')
      .then(res => res.json())
      .then(data => {
        // Add count data to features
        const enrichedData = {
          ...data,
          features: data.features.map((feature: any) => {
            const countryName = feature.properties.name_en || feature.properties.name;
            const countryData = countryMap.get(countryName.toLowerCase());
            return {
              ...feature,
              properties: {
                ...feature.properties,
                count: countryData?.count || 0,
                hasData: !!countryData
              }
            };
          })
        };
        setGeoData(enrichedData);

        // Check for unmapped countries
        const mappedCountries = new Set(
          data.features
            .map((f: any) => (f.properties.name_en || f.properties.name).toLowerCase())
        );
        
        const unmapped = countrySummary
          .filter(c => !mappedCountries.has(c.country.toLowerCase()))
          .map(c => c.country)
          .filter(country => country.toLowerCase() !== 'unknown' && country.toLowerCase() !== 'missing');
        
        setUnmappedCountries(unmapped);
      });
  }, [countrySummary, countryMap]);

  const style = (feature?: Feature) => {
    if (!feature || !feature.properties) return {};
    
    const countryName = feature.properties.name_en || feature.properties.name;
    const isHovered = countryName === hoveredCountry;
    const isSelected = countryName === selectedCountry;
    const hasData = feature.properties.hasData;
    const count = feature.properties.count || 0;
    
    const baseStyle: PathOptions = {
      fillColor: hasData ? colorScale(count) : '#e0e0e0',
      weight: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: 1,
      color: isSelected ? '#000' : isHovered ? '#1e40af' : '#666',
      fillOpacity: isHovered ? 0.9 : 0.7
    };
    
    return baseStyle;
  };

  const onEachFeature = (feature: Feature, layer: any) => {
    if (feature.properties) {
      const countryName = feature.properties.name_en || feature.properties.name;
      const countryData = countryMap.get(countryName.toLowerCase());
      
      layer.on({
        mouseover: () => {
          setHoveredCountry(countryName);
          if (countryData) {
            setPopupInfo({
              country: countryName,
              count: countryData.count
            });
            layer.bindPopup(`${countryName}: ${countryData.count} sequences`).openPopup();
          }
        },
        mouseout: () => {
          setHoveredCountry(null);
          setPopupInfo(null);
          layer.closePopup();
        },
        click: () => {
          if (countryData) {
            setSelectedCountry(countryName);
            onCountryClick(countryName, countryData.data);
          }
        }
      });
    }
  };

  return (
    <div>
      {unmappedCountries.length > 0 && (
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p className="font-bold">Warning: Some countries could not be mapped</p>
          <p className="text-sm mt-1">
            The following countries from the dataset could not be matched to the map: {unmappedCountries.join(', ')}
          </p>
          <p className="text-xs mt-2 text-yellow-600">
            This may be due to differences in country naming conventions.
          </p>
        </div>
      )}
      <div className="relative h-[500px] w-full rounded-lg shadow-lg overflow-hidden">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoData && (
            <GeoJSON
              key={`${hoveredCountry}-${selectedCountry}`}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;