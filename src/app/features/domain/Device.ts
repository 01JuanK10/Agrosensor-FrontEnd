import { User } from "./User";

export interface DeviceLocation {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
}

export interface Device {
  id: string;
  type: string;
  active: boolean;
  location: DeviceLocation;
  client: User | null;
}
