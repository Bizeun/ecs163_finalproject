# The Evolution of Speed: How F1 Lap Times Changed

**Team 21**: Sukhyun Hwang, Christopher Wong, Chun Yat Chu  
**Course**: ECS 163 - Information Visualization  


## Description

This project investigates a fascinating paradox in Formula 1: despite 75 years of technological advancement, many lap records from the early 2000s V10 era remain unbroken. Our interactive data visualization analyzes 551,742 lap time records across 14 qualifying F1 circuits to reveal how regulatory evolution has created performance ceilings that counteract technological progress.

The application features multiple coordinated visualizations built with React and D3.js:

- **Immersive Scrolling Homepage**: Parallax scrolling with era-appropriate F1 car silhouettes evolving through technological periods
- **Interactive World Map**: Geographic exploration of 14 qualifying circuits with clickable markers
- **Enhanced Temporal Line Charts**: Circuit-specific lap time evolution with era-based background shading and interactive tooltips
- **Stacked Bar Chart**: Cross-circuit era participation analysis revealing lap record dominance patterns
- **Multi-Stage Sankey Diagram**: Flow visualization showing manufacturers → engine eras → horsepower → performance relationships

**Key Finding**: The V10 era (1995-2005) with ~850 HP still holds more lap records than modern hybrid cars (2014-2024) with 1000+ HP, demonstrating how regulations create performance ceilings despite technological advancement.

**Datasets**: We use publicly available F1 data from Kaggle (1996-2024) including 551,742 lap times, circuit information, constructor data, and race results. While originally scoped for 1950-2024, dataset availability constraints led us to focus on 1996-2024, which effectively demonstrates the core V10 vs. hybrid era paradox.

## Installation

### Prerequisites
- Node.js (version 14 or higher)



### Setup Instructions

**1. Clone the repository**

git clone https://github.com/[your-username]/f1-evolution-speed  
cd f1-evolution-speed

**2. Install dependencies**

npm install

**3. Download and setup datasets**

Create a data directory:  
mkdir -p public/data

Download these datasets from [Kaggle F1 Championship](https://www.kaggle.com/datasets/rohanrao/formula-1-world-championship-1950-2020) and place in `public/data/`:
- `races.csv`
- `circuits.csv` 
- `lap_times.csv`
- `constructors.csv`
- `constructor_results.csv`

> **Note**: Requires Kaggle account. But, basically datasets are included.

## Execution

### Running the Application

**1. Start the development server**

npm start

**2. Open browser and navigate to `http://localhost:3000`**

**3. Demo Usage**
- **Homepage**: Scroll through F1 evolution timeline with animated car silhouettes
- **Circuit Exploration**: Click circuit markers on world map for detailed analysis
- **Lap Time Charts**: Hover over data points for detailed information and fastest lap records
- **Era Analysis**: View stacked bar chart showing era dominance across circuits
- **Paradox Explanation**: Explore Sankey diagram showing power vs. performance relationships

### Build for Production

npm run build

## Technical Architecture

### Key Components
| Component | Description |
|-----------|-------------|
| `WorldMap.js` | Leaflet-based interactive map with circuit markers |
| `LapTimeChart.js` | D3.js line charts with era backgrounds and tooltips |
| `StackBarChart.js` | D3.js stacked visualization showing era participation |
| `GlobalSankey.js` | D3.js multi-stage flow diagram for paradox analysis |
| `DynamicPage.js` | Immersive scrolling homepage with parallax effects |

### Dependencies
- **React** - UI framework
- **D3.js** - Data visualizations
- **Leaflet/React-Leaflet** - Interactive maps
