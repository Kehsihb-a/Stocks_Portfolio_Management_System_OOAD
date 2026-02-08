import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const Sparkline = ({ data = [], stroke = '#1d5fd1' }) => {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
