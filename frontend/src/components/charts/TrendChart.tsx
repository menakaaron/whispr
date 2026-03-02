"use client";

import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = {
  label: string;
  pronunciation: number;
  fluency: number;
  tone: number;
};

export function TrendChart({ data }: { data: Datum[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.3} />
          <XAxis dataKey="label" tickMargin={8} fontSize={12} />
          <YAxis domain={[0, 100]} tickMargin={8} fontSize={12} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            }}
          />
          <Line
            type="monotone"
            dataKey="pronunciation"
            stroke="#0f172a"
            strokeWidth={2}
            dot={false}
          />
          <Line type="monotone" dataKey="fluency" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tone" stroke="#16a34a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

