
export interface SensorData {
  tankId: number;
  levelLiters: number;
  percentage: number;
  temperature?: number;
  distance?: number;
  previousLevelLiters?: number;
  minutesSinceLastReading?: number;
  rawData?: any;
}

export interface ISensor {
  read(): Promise<SensorData>;
  getSensorType(): string;
}