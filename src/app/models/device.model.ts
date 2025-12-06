export interface DeviceLocation {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
}

export interface DeviceClient {
  id: number;
  cc: number;
}

export interface Device {
  id: string;
  type: string;
  active: boolean;
  location: DeviceLocation;
  client: DeviceClient;
}
