import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ChartOptions, ChartData, ArcElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Title, Tooltip, Legend);

interface PieChartProps {
  chartData: ChartData<'pie'>;
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ chartData, title }) => {
  // Verifica se há dados válidos
  const hasData = chartData.datasets?.some(dataset => 
    dataset.data?.some(value => value > 0)
  ) || false;

  const processedData = {
    ...chartData,
    datasets: chartData.datasets?.map(dataset => {
      const backgroundColors = Array.isArray(dataset.backgroundColor)
        ? dataset.backgroundColor
        : (typeof dataset.backgroundColor === 'string' 
            ? [dataset.backgroundColor] 
            : ['#cccccc']); 
      
      return {
        ...dataset,
        backgroundColor: backgroundColors,
        borderWidth: 1
      };
    })
  };

  const options: ChartOptions<'pie'> = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <div style={{ width: 500, minHeight: 300 }}>
      {hasData ? (
        <Pie data={processedData} options={options}/>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          border: '1px dashed #ddd',
          borderRadius: 8,
          backgroundColor: '#f9f9f9'
        }}>
          <p style={{ color: '#666' }}>Nenhum dado para exibir</p>
        </div>
      )}
    </div>
  );
};

export default PieChart;