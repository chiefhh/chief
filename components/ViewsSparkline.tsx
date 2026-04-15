interface DataPoint {
  date: string;
  count: number;
}

interface ViewsSparklineProps {
  data: DataPoint[];
}

export function ViewsSparkline({ data }: ViewsSparklineProps) {
  const WIDTH = 300;
  const HEIGHT = 52;
  const PADDING_Y = 4;

  // Delta: last 7 days vs prior 7 days
  const last7 = data.slice(-7).reduce((s, d) => s + d.count, 0);
  const prior7 = data.slice(0, 7).reduce((s, d) => s + d.count, 0);
  const delta = prior7 === 0 ? null : Math.round(((last7 - prior7) / prior7) * 100);

  const hasData = data.length >= 2 && data.some((d) => d.count > 0);
  const maxCount = hasData ? Math.max(...data.map((d) => d.count), 1) : 1;

  const points: [number, number][] = data.map((d, i) => [
    (i / (data.length - 1)) * WIDTH,
    HEIGHT - PADDING_Y - (d.count / maxCount) * (HEIGHT - PADDING_Y * 2),
  ]);

  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPath =
    `M${points[0][0]},${points[0][1]} ` +
    points.slice(1).map(([x, y]) => `L${x},${y}`).join(" ") +
    ` L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const flatLine = `M0,${HEIGHT - PADDING_Y} L${WIDTH},${HEIGHT - PADDING_Y}`;
  const lastPt = points[points.length - 1];

  return (
    <div className="pt-3 pb-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-[9px] tracking-widest text-[#444] uppercase">
          Profile Views · 14 days
        </span>
        {delta !== null && (
          <span
            className="font-body text-[10px] font-medium"
            style={{ color: delta >= 0 ? "#4ade80" : "#f87171" }}
          >
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "52px", display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="views-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8944F" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#B8944F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {hasData ? (
          <>
            <path d={areaPath} fill="url(#views-gradient)" />
            <polyline
              points={polyline}
              fill="none"
              stroke="#B8944F"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Dot on latest point */}
            <circle cx={lastPt[0]} cy={lastPt[1]} r="5" fill="#B8944F" fillOpacity="0.15" />
            <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill="#B8944F" />
          </>
        ) : (
          <path d={flatLine} fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 3" />
        )}
      </svg>

      {/* Axis labels */}
      <div className="flex justify-between mt-1">
        <span className="font-body text-[9px] text-[#333]">14d ago</span>
        <span className="font-body text-[9px] text-[#333]">7d ago</span>
        <span className="font-body text-[9px] text-[#333]">Today</span>
      </div>
    </div>
  );
}
