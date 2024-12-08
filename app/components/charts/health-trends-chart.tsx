import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Jan",
    diabetes: 65,
    heartDisease: 45,
    hypertension: 55,
  },
  {
    month: "Feb",
    diabetes: 59,
    heartDisease: 49,
    hypertension: 58,
  },
  {
    month: "Mar",
    diabetes: 62,
    heartDisease: 42,
    hypertension: 52,
  },
  {
    month: "Apr",
    diabetes: 58,
    heartDisease: 47,
    hypertension: 54,
  },
  {
    month: "May",
    diabetes: 55,
    heartDisease: 43,
    hypertension: 49,
  },
  {
    month: "Jun",
    diabetes: 52,
    heartDisease: 39,
    hypertension: 48,
  },
];

export function HealthTrendsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="diabetes"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="heartDisease" stroke="#82ca9d" />
        <Line type="monotone" dataKey="hypertension" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
} 