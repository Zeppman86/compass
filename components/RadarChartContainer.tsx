
import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { LifeValue, DailyAction } from '../types';

interface Props {
  values: LifeValue[];
  actions: DailyAction[];
  onValueClick?: (valueId: string) => void;
}

const RadarChartContainer: React.FC<Props> = ({ values, actions, onValueClick }) => {
  const data = values.map(v => {
    const actionScore = actions.reduce((sum, action) => {
      const relevantImpact = action.impacts.find(imp => imp.valueId === v.id);
      return sum + (relevantImpact ? relevantImpact.impact : 0);
    }, 0);
    
    const normalizedAction = Math.min(Math.max((actionScore / 2) + 5, 0), 10);

    return {
      id: v.id,
      subject: v.name.length > 12 ? v.name.substring(0, 10) + '..' : v.name,
      importance: v.importance,
      actionLevel: normalizedAction,
      fullValueName: v.name
    };
  });

  const handleChartClick = (data: any) => {
    if (onValueClick && data && data.activePayload && data.activePayload[0]) {
      onValueClick(data.activePayload[0].payload.id);
    }
  };

  return (
    <div className="w-full h-[350px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius="75%" 
          data={data}
          onClick={handleChartClick}
        >
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b', fontSize: 10, cursor: 'pointer' }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Важность"
            dataKey="importance"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            isAnimationActive={true}
            animationDuration={1500}
          />
          <Radar
            name="Действия"
            dataKey="actionLevel"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
            isAnimationActive={true}
            animationDuration={1500}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartContainer;
