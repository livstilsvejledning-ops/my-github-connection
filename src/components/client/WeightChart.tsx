import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightEntry[];
  goalWeight?: number;
  startWeight?: number;
}

export function WeightChart({ data, goalWeight, startWeight }: WeightChartProps) {
  const formattedData = data.map(entry => ({
    ...entry,
    dateLabel: format(new Date(entry.date), 'd. MMM', { locale: da })
  }));

  // Calculate Y axis domain
  const weights = data.map(d => d.weight);
  const allValues = [...weights];
  if (goalWeight) allValues.push(goalWeight);
  if (startWeight) allValues.push(startWeight);
  
  const minWeight = Math.min(...allValues) - 2;
  const maxWeight = Math.max(...allValues) + 2;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <h3 className="font-semibold text-foreground mb-4">Vægt Udvikling</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(20 15% 45%)' }}
            />
            <YAxis 
              domain={[minWeight, maxWeight]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(20 15% 45%)' }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0 0% 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => [`${value} kg`, 'Vægt']}
              labelFormatter={(label) => label}
            />
            
            {/* Goal weight reference line */}
            {goalWeight && (
              <ReferenceLine 
                y={goalWeight} 
                stroke="hsl(16 100% 60%)" 
                strokeDasharray="5 5"
                label={{ 
                  value: `Mål: ${goalWeight}kg`, 
                  position: 'right',
                  fontSize: 11,
                  fill: 'hsl(16 100% 60%)'
                }}
              />
            )}
            
            {/* Start weight reference line */}
            {startWeight && (
              <ReferenceLine 
                y={startWeight} 
                stroke="hsl(20 15% 45%)" 
                strokeDasharray="3 3"
                label={{ 
                  value: `Start: ${startWeight}kg`, 
                  position: 'right',
                  fontSize: 11,
                  fill: 'hsl(20 15% 45%)'
                }}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="weight"
              stroke="url(#weightGradient)"
              strokeWidth={3}
              dot={{ fill: 'hsl(16 100% 60%)', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: 'hsl(16 100% 60%)', strokeWidth: 2, stroke: '#fff', r: 6 }}
            />
            
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(16 100% 60%)" />
                <stop offset="100%" stopColor="hsl(24 52% 51%)" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      {data.length > 1 && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total ændring</p>
            <p className={`text-lg font-bold ${
              data[data.length - 1].weight < data[0].weight ? 'text-success' : 'text-destructive'
            }`}>
              {(data[data.length - 1].weight - data[0].weight).toFixed(1)} kg
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Gns. pr. uge</p>
            <p className="text-lg font-bold text-foreground">
              {((data[data.length - 1].weight - data[0].weight) / Math.max(data.length, 1)).toFixed(2)} kg
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Aktuel</p>
            <p className="text-lg font-bold text-primary">
              {data[data.length - 1]?.weight || '-'} kg
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
