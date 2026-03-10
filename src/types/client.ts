export interface ClientContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  city: string;
  country: string;
  domain: string;
  contacts: ClientContact[];
}
