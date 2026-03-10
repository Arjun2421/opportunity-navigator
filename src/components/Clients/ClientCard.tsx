import { useState } from 'react';
import { ClientRecord } from '@/types/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, MapPin, Globe, ChevronDown, ChevronUp, Copy, Check, Mail, Phone, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClientCardProps {
  client: ClientRecord;
  onDelete: (id: string) => void;
}

export function ClientCard({ client, onDelete }: ClientCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => { e.stopPropagation(); copyToClipboard(text, label); }}
          className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted transition-colors"
        >
          {copiedField === label ? (
            <Check className="h-3 w-3 text-accent" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">Copy {label}</TooltipContent>
    </Tooltip>
  );

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-info to-accent" />

      <CardContent className="p-4 sm:p-5">
        {/* Collapsed: Name + Domain + Location summary */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-base">{client.name}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                {client.domain && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" /> {client.domain}
                  </span>
                )}
                {(client.city || client.country) && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {[client.city, client.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {client.contacts.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" />{client.contacts.length}
              </Badge>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded: Full details */}
        {expanded && (
          <div className="mt-4 space-y-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Location details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              {client.city && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-medium text-foreground">{client.city}</span>
                </div>
              )}
              {client.country && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium text-foreground">{client.country}</span>
                </div>
              )}
              {client.domain && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Domain:</span>
                  <span className="font-medium text-foreground">{client.domain}</span>
                </div>
              )}
            </div>

            {/* Contacts */}
            {client.contacts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contacts ({client.contacts.length})
                </h4>
                <div className="space-y-2">
                  {client.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-sm text-foreground truncate">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[180px]">{contact.email}</span>
                            <CopyBtn text={contact.email} label={`${contact.firstName}'s email`} />
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                            <CopyBtn text={contact.phone} label={`${contact.firstName}'s phone`} />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {client.contacts.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No contacts added yet.</p>
            )}

            {/* Delete action */}
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                onClick={() => onDelete(client.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
