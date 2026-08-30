export interface User {
  id: number;
  name: string;
  email: string;
  isOnline?: boolean;
  monitorToken?: string;
}

export interface Owner {
  id: number;
  name: string;
}

export interface Store {
  id: number;
  name: string;
  url: string;
  color: string;
  ownerId: number;
  owner?: Owner;
}

export interface Category {
  id: number;
  name: string;
}