import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Search, X, Plus, Upload } from 'lucide-react';
import { useClientStore } from '@/hooks/useClientStore';
import { ClientCard } from '@/components/Clients/ClientCard';
import { AddClientDialog } from '@/components/Clients/AddClientDialog';
import { ImportClientsDialog } from '@/components/Clients/ImportClientsDialog';

const Clients = () => {
  const { clients, addClient, deleteClient, importFromExcel, generateTemplate } = useClientStore();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const fields = [
        c.name, c.city, c.country, c.domain,
        ...c.contacts.flatMap((ct) => [ct.firstName, ct.lastName, ct.email, ct.phone]),
      ];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [clients, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Clients
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} in directory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, city, domain, contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        {search && (
          <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => setSearch('')}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            {clients.length === 0 ? 'No clients yet' : 'No matches found'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {clients.length === 0
              ? 'Add your first client manually or import from an Excel file.'
              : 'Try adjusting your search terms.'}
          </p>
          {clients.length === 0 && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-1" /> Import
              </Button>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Client
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} onDelete={deleteClient} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addClient} />
      <ImportClientsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={importFromExcel}
        onGenerateTemplate={generateTemplate}
      />
    </div>
  );
};

export default Clients;
