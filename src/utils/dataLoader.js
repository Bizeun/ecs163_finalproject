import Papa from 'papaparse';

export const loadCSV = async (filename) => {
  try {
    const response = await fetch(`/data/${filename}`);
    const text = await response.text();
    const result = Papa.parse(text, { 
      header: true, 
      dynamicTyping: true,
      skipEmptyLines: true 
    });
    return result.data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};