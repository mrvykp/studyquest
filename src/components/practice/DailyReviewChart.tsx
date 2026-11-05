import type { IDailyPracticeStat } from "../../types/practice";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Card } from "antd";

interface DailyReviewChartProps {
  stats: IDailyPracticeStat[];
}

const DailyReviewChart = ({ stats }: DailyReviewChartProps) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: stats.map((day) => day.date.slice(5)),
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: (value) => String(Math.round(value)),
      },
    },
    legend: {
      position: "top",
    },
  };

  const series = [
    {
      name: "Reviewed",
      data: stats.map((day) => day.reviewed),
    },
    {
      name: "Remembered",
      data: stats.map((day) => day.remembered),
    },
  ];

  return (
    <Card title="Last 7 Days">
      <Chart type="bar" options={options} series={series} height={320} />
    </Card>
  );
};

export default DailyReviewChart;
