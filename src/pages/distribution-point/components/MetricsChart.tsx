import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  IRequestedProduct,
  RequestedProductStatus,
} from "../../../interfaces/distribution-point";
import React from "react";

interface IMetricsChartProps {
  requestedProducts: IRequestedProduct[];
}

export function MetricsChart({ requestedProducts }: IMetricsChartProps) {
  const style = (status: RequestedProductStatus) => {
    switch (status) {
      case RequestedProductStatus.DELIVERED:
        return { color: "#34D399", text: "Entregue" };
      case RequestedProductStatus.FULL:
        return { color: "#FBBF24", text: "Aguardando" };
      case RequestedProductStatus.OPEN:
      default:
        return { color: "#3B82F6", text: "Ativo" };
    }
  };

  const data = React.useMemo(() => {
    const data = requestedProducts.map((requestedProduct) => {
      const fill = style(requestedProduct.status).color;

      const product = requestedProduct.product;

      return {
        name: product.name,
        uv: Math.min(
          100,
          (requestedProduct.donatedQuantity / requestedProduct.requestedQuantity) * 100,
        ),
        fill: fill,
        status: requestedProduct.status,
        actual: `${requestedProduct.donatedQuantity} / ${requestedProduct.requestedQuantity} ${product.unit}`,
      };
    });

    data.sort((a, b) => b.uv - a.uv);

    return data;
  }, [requestedProducts]);

  return (
    <div className="card rounded-2xl bg-base-100 shadow-xl h-80">
      <div className="card-body items-center text-center p-4">
        <h3 className="card-title text-sm uppercase tracking-wide opacity-70">
          Métricas de Arrecadação
        </h3>
        <div className="w-full h-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="100%"
              barSize={15}
              data={data}
            >
              <RadialBar
                label={{ position: "insideStart", fill: "#fff" }}
                background
                dataKey="uv"
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                wrapperStyle={{ right: 0 }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const item = payload[0].payload;
                    const statusText = style(item.status).text;

                    return (
                      <div className="bg-base-100 p-2 border border-base-300 shadow-lg rounded text-base-content text-sm">
                        <p className="font-bold">{item.name}</p>
                        <p>Progresso: {item.uv.toFixed(0)}%</p>
                        <p>Status: {statusText}</p>
                        <p>{item.actual}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default MetricsChart;
