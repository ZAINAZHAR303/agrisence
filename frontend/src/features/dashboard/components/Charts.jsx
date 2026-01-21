import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardTitle } from "@/components/ui";
import { SOIL_DATA, NUTRIENT_DATA } from "@/constants";

export const MoistureChart = () => {
  return (
    <Card>
      <CardTitle>Soil Moisture Trend</CardTitle>
      <CardContent className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SOIL_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="moisture"
              stroke="#16a34a"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const NutrientChart = () => {
  return (
    <Card>
      <CardTitle>Soil Nutrient Levels</CardTitle>
      <CardContent className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={NUTRIENT_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#22c55e"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
