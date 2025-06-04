# Mapoplexus

A simple geospatial visualization tool for Pathoplexus data.

## Overview

Mapoplexus is a web application that provides interactive map-based visualization of genomic data from [Pathoplexus](https://pathoplexus.org). It displays sample counts by country and allows users to explore detailed data for each geographic location.

## Features

- Interactive world map showing sample distribution by country
- Click on countries to view detailed sample data
- Data table with sortable columns for exploring individual samples
- Responsive design that works on desktop and mobile devices

## Usage

Mapoplexus is designed to be accessed through the Pathoplexus platform:

1. Visit [Pathoplexus](https://pathoplexus.org)
2. Navigate to an organism dataset
3. Access Mapoplexus through the Tools menu

The application will receive the dataset URL as a parameter and automatically fetch and visualize the data.

## Technology Stack

- **Next.js 15** - React framework for production
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Mapbox GL JS** - Interactive map visualization
- **D3.js** - Data visualization (color scales)

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Running locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for production

```bash
npm run build
```

### Starting production server

```bash
npm start
```

## Project Structure

```
mapoplexus/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── fetch-data/    # Data fetching endpoint
│   ├── page.tsx           # Main page component
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── DataTable.tsx      # Sample data table
│   └── MapComponent.tsx   # Interactive map
├── public/                # Static assets
│   └── countries.geojson  # Country boundaries
└── package.json           # Dependencies and scripts
```

## License

MIT