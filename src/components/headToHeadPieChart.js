import { PieChart, Pie, ResponsiveContainer, Sector, Cell } from 'recharts';

const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'];
const RADIAN = Math.PI / 180;

const renderLabel = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, label, percent, value, index } = props;
    console.log(props);
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy  + radius * Math.sin(-midAngle * RADIAN);
  if (label === 'Draws') {
    return;
  }

  if (index === 0) {
    return (
      <g>
        <text x={cx - 150} y={cy} fill={fill} textAnchor={'middle'} font-size={"2rem"} dominantBaseline="central">
          {label}
        </text>
        <text x={cx - 150} y={cy} dy={40} fill={fill} textAnchor={'middle'} font-size={"2rem"} dominantBaseline="central">
          {Math.round(percent * 100)}%
        </text>
      </g>
    );
  }

  return (
    <g>
      <text x={cx + 150} y={cy} fill={fill} textAnchor={'middle'} font-size={"2rem"} dominantBaseline="central">
        {label}
      </text>
      <text x={cx + 150} y={cy} dy={40} fill={fill} textAnchor={'middle'} font-size={"2rem"} dominantBaseline="central">
        {Math.round(percent * 100)}%
      </text>
    </g>
  );
};

const renderActiveShape = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy - 10} dy={0} textAnchor="middle" fill={"#777"}>{payload.label}</text>
      <text x={cx} y={cy + 12} dy={10} textAnchor="middle" font-size={"2rem"} fill={"#777"}>{payload.wins}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={payload.label === 'Draws' ? '#CCC' : fill}
      />
    </g>
  );
};

const HeadToHeadPieChart = ({ pieData, activeIndex, onPieClick }) => {
  return (
    <ResponsiveContainer width={"100%"} height={300}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={pieData}
          dataKey="wins"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          fill="#8884d8"
          onClick={(data, index) => onPieClick(data, index)}
          label={renderLabel}
          labelLine={false}
          startAngle={270}
          endAngle={-90}
        >
        {
          pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.label === 'Draws' ? '#EFEFEF' : COLORS[index % COLORS.length]}/>)
        }
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default HeadToHeadPieChart;