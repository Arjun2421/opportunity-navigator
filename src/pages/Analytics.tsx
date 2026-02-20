import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Users, Building2, Target, Calendar, DollarSign, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import * as XLSX from 'xlsx';

const COLORS = ['hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(220, 9%, 46%)'];

const Analytics = () => {
  const { tenders } = useData();
  const { formatCurrency, currency } = useCurrency();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const displayTenders = useMemo(() => {
    if (!activeFilter) return tenders;
    return tenders.filter(t => t.avenirStatus === activeFilter || t.client === activeFilter || t.groupClassification === activeFilter);
  }, [tenders, activeFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const active = displayTenders.filter(t => ['WORKING', 'ONGOING', 'SUBMITTED', 'AWARDED'].includes((t.avenirStatus || '').toUpperCase()));
    const won = displayTenders.filter(t => (t.avenirStatus || '').toUpperCase() === 'AWARDED');
    const lost = displayTenders.filter(t => ['LOST', 'REGRETTED'].includes((t.avenirStatus || '').toUpperCase()));
    const totalValue = displayTenders.reduce((s, t) => s + t.value, 0);
    return {
      totalActive: active.length,
      wonCount: won.length,
      lostCount: lost.length,
      totalPipelineValue: totalValue,
    };
  }, [displayTenders]);

  // Stage distribution
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {};
    displayTenders.forEach(t => {
      const s = t.avenirStatus || 'UNKNOWN';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [displayTenders]);

  // Group distribution
  const groupData = useMemo(() => {
    const groups: Record<string, { count: number; value: number }> = {};
    displayTenders.forEach(t => {
      const g = t.groupClassification || 'Unknown';
      if (!groups[g]) groups[g] = { count: 0, value: 0 };
      groups[g].count++;
      groups[g].value += t.value;
    });
    return Object.entries(groups).map(([name, data]) => ({ name, count: data.count, value: data.value / 1000000 }));
  }, [displayTenders]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { count: number; value: number }> = {};
    displayTenders.forEach(t => {
      if (t.rfpReceivedDate) {
        const month = t.rfpReceivedDate.substring(0, 7);
        if (!months[month]) months[month] = { count: 0, value: 0 };
        months[month].count++;
        months[month].value += t.value;
      }
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: data.count,
        value: data.value / 1000000,
      }));
  }, [displayTenders]);

  // Lead performance
  const leadPerformance = useMemo(() => {
    const leads: Record<string, { count: number; won: number; lost: number; value: number }> = {};
    displayTenders.forEach(t => {
      if (!t.lead) return;
      if (!leads[t.lead]) leads[t.lead] = { count: 0, won: 0, lost: 0, value: 0 };
      leads[t.lead].count++;
      leads[t.lead].value += t.value;
      const s = (t.avenirStatus || '').toUpperCase();
      if (s === 'AWARDED') leads[t.lead].won++;
      if (s === 'LOST' || s === 'REGRETTED') leads[t.lead].lost++;
    });
    return Object.entries(leads)
      .map(([name, data]) => ({ name, ...data, winRate: data.won + data.lost > 0 ? Math.round((data.won / (data.won + data.lost)) * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [displayTenders]);

  // Client data
  const clientData = useMemo(() => {
    const clients: Record<string, { count: number; value: number }> = {};
    displayTenders.forEach(t => {
      if (!t.client) return;
      if (!clients[t.client]) clients[t.client] = { count: 0, value: 0 };
      clients[t.client].count++;
      clients[t.client].value += t.value;
    });
    return Object.entries(clients)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [displayTenders]);

  const handlePieClick = (_: any, index: number) => {
    const clicked = stageData[index]?.name;
    setActiveFilter(activeFilter === clicked ? null : clicked);
  };

  const handleBarClick = (data: any) => {
    if (data?.name) setActiveFilter(activeFilter === data.name ? null : data.name);
  };

  const handleExport = () => {
    const sheets: Record<string, any[]> = {
      'Stage Distribution': stageData,
      'Group Performance': groupData.map(g => ({ ...g, value: `${g.value.toFixed(1)}M` })),
      'Monthly Trend': monthlyTrend.map(m => ({ ...m, value: `${m.value.toFixed(1)}M` })),
      'Lead Performance': leadPerformance,
      'Top Clients': clientData,
    };
    const wb = XLSX.utils.book_new();
    Object.entries(sheets).forEach(([name, data]) => {
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name);
    });
    XLSX.writeFile(wb, 'analytics-export.xlsx');
  };

  const currencyPrefix = currency === 'AED' ? 'AED ' : '$';
  const fmtVal = (v: number) => `${currencyPrefix}${v.toFixed(1)}M`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Pipeline performance and insights
            {activeFilter && (
              <Badge variant="secondary" className="ml-2 cursor-pointer" onClick={() => setActiveFilter(null)}>
                Filtered: {activeFilter} ✕
              </Badge>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export XLSX
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.totalActive}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.wonCount}</p>
          <p className="text-xs text-muted-foreground">Won</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.lostCount}</p>
          <p className="text-xs text-muted-foreground">Lost</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{formatCurrency(stats.totalPipelineValue)}</p>
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
        </CardContent></Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" onClick={handlePieClick} className="cursor-pointer">
                    {stageData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Group Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => fmtVal(v)} />
                  <YAxis type="category" dataKey="name" width={50} />
                  <Tooltip formatter={(v: number) => [fmtVal(v), 'Value']} />
                  <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} onClick={handleBarClick} className="cursor-pointer" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Monthly Pipeline Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => fmtVal(v)} />
                  <Tooltip formatter={(v: number) => [fmtVal(v), 'Value']} />
                  <Area type="monotone" dataKey="value" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Lead Win/Loss Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="won" name="Won" fill="hsl(142, 76%, 36%)" stackId="a" />
                  <Bar dataKey="lost" name="Lost" fill="hsl(0, 84%, 60%)" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Top Clients by Pipeline Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Value']} />
                <Bar dataKey="value" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} onClick={handleBarClick} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
