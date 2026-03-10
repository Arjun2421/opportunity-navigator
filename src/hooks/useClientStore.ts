import { useState, useEffect, useCallback } from 'react';
import { ClientRecord, ClientContact } from '@/types/client';

const STORAGE_KEY = 'client_records';

function generateId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 11);
}

/** Normalize name: trim, collapse whitespace, title-case */
function normalizeName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function loadClients(): ClientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveClients(clients: ClientRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function useClientStore() {
  const [clients, setClients] = useState<ClientRecord[]>(loadClients);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  const addClient = useCallback((data: Omit<ClientRecord, 'id'>) => {
    const normalized: ClientRecord = {
      ...data,
      id: generateId(),
      name: normalizeName(data.name),
      contacts: data.contacts.map((c) => ({ ...c, id: c.id || generateId() })),
    };
    setClients((prev) => {
      // Merge if same normalized name exists
      const idx = prev.findIndex((p) => p.name === normalized.name);
      if (idx >= 0) {
        const merged = { ...prev[idx] };
        if (normalized.city) merged.city = normalized.city;
        if (normalized.country) merged.country = normalized.country;
        if (normalized.domain) merged.domain = normalized.domain;
        const existingEmails = new Set(merged.contacts.map((c) => c.email.toLowerCase()));
        normalized.contacts.forEach((c) => {
          if (!existingEmails.has(c.email.toLowerCase())) {
            merged.contacts.push(c);
          }
        });
        const next = [...prev];
        next[idx] = merged;
        return next;
      }
      return [...prev, normalized];
    });
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const importFromExcel = useCallback((rows: Record<string, string>[]) => {
    const map = new Map<string, Omit<ClientRecord, 'id'>>();

    rows.forEach((row) => {
      const rawName = row['Company Name'] || row['company name'] || row['Name'] || row['name'] || '';
      if (!rawName.trim()) return;
      const name = normalizeName(rawName);
      const city = row['City'] || row['city'] || '';
      const country = row['Country'] || row['country'] || '';
      const domain = row['Domain'] || row['domain'] || row['Field'] || row['field'] || '';
      const firstName = row['First Name'] || row['first name'] || row['Contact First Name'] || '';
      const lastName = row['Last Name'] || row['last name'] || row['Contact Last Name'] || '';
      const email = row['Email'] || row['email'] || row['Contact Email'] || '';
      const phone = row['Phone'] || row['phone'] || row['Contact Phone'] || '';

      const contact: ClientContact = {
        id: generateId(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      if (map.has(name)) {
        const existing = map.get(name)!;
        if (city.trim()) existing.city = city.trim();
        if (country.trim()) existing.country = country.trim();
        if (domain.trim()) existing.domain = domain.trim();
        if (contact.firstName || contact.email) existing.contacts.push(contact);
      } else {
        map.set(name, {
          name,
          city: city.trim(),
          country: country.trim(),
          domain: domain.trim(),
          contacts: contact.firstName || contact.email ? [contact] : [],
        });
      }
    });

    let count = 0;
    map.forEach((v) => { addClient(v); count++; });
    return count;
  }, [addClient]);

  const generateTemplate = useCallback(() => {
    return [
      ['Company Name', 'City', 'Country', 'Domain', 'First Name', 'Last Name', 'Email', 'Phone'],
      ['Acme Corp', 'Dubai', 'UAE', 'Engineering', 'John', 'Doe', 'john@acme.com', '+971501234567'],
      ['Acme Corp', '', '', '', 'Jane', 'Smith', 'jane@acme.com', '+971551234567'],
      ['Acme Corp', '', '', '', 'Ali', 'Khan', 'ali@acme.com', '+971559876543'],
      ['Beta LLC', 'Abu Dhabi', 'UAE', 'Construction', 'Sara', 'Ahmed', 'sara@beta.com', '+971501112233'],
    ];
  }, []);

  return { clients, addClient, deleteClient, importFromExcel, generateTemplate };
}
