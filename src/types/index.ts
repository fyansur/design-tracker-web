export interface User {
  id: number;
  name: string;
  email: string;
  isOnline?: boolean;
  monitorToken?: string;
}