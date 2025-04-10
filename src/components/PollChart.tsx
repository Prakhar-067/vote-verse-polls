
import React from "react";
import { Poll } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { cn } from "@/lib/utils";

interface PollChartProps {
  poll: Poll;
  className?: string;
}

const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C4B5FD', '#DDD6FE'];

const PollChart: React.FC<PollChartProps> = ({ poll, className }) => {
  // Filter out options with 0 votes for better visualization
  const data = poll.options
    .filter(option => option.votes > 0)
    .map((option, index) => ({
      name: option.text,
      value: option.votes,
      color: COLORS[index % COLORS.length]
    }));

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  if (totalVotes === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <p className="text-muted-foreground text-center">No votes yet</p>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} votes`, null]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PollChart;
