import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardTitle, CardContent } from "@/components/ui";
import { SOIL_MONITORING_DATA } from "@/constants";

export const SoilDataTrend = ({ theme = "light" }) => {
  return (
    <Card>
      <CardTitle>Soil Data Trends</CardTitle>
      <CardContent className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={SOIL_MONITORING_DATA}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
            />
            <XAxis
              dataKey="time"
              stroke={theme === "dark" ? "#f3f4f6" : "#1f2937"}
            />
            <YAxis stroke={theme === "dark" ? "#f3f4f6" : "#1f2937"} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
              }}
            />
            <Line
              type="monotone"
              dataKey="moisture"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ph"
              stroke="#FBBF24"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="nitrogen"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
