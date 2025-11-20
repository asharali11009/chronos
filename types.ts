export interface WeatherData {
  temperature: number;
  conditionCode: number;
  isDay: boolean;
}

export interface WorldCity {
  name: string;
  timezone: string;
  flag: string;
}

export interface QuoteData {
  text: string;
  author: string;
}

export enum ClockMode {
  DIGITAL = 'DIGITAL',
  ANALOG = 'ANALOG'
}

export enum Tab {
  CLOCK = 'CLOCK',
  STOPWATCH = 'STOPWATCH',
  TIMER = 'TIMER'
}

export interface ThemeOption {
  id: string;
  name: string;
  gradientClass: string;
}