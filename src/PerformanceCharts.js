import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Sector,
  ComposedChart, Area
} from 'recharts';
import './PerformanceCharts.css'; // Import the CSS file

// Sample data structures - replace with your actual data
const SAMPLE_SUPPLIER_DATA = [
    { name: 'Avery Dennison India', rating: 92, onTimeDelivery: 95, qualityScore: 90, responseTime: 85 },
    { name: 'SML India', rating: 78, onTimeDelivery: 75, qualityScore: 85, responseTime: 70 },
    { name: 'R- Pac', rating: 72, onTimeDelivery: 75, qualityScore: 60, responseTime: 50 },
    { name: 'Maxim', rating: 65, onTimeDelivery: 60, qualityScore: 70, responseTime: 65 },
    { name: 'ITL India', rating: 80, onTimeDelivery: 85, qualityScore: 75, responseTime: 80 },
    { name: 'Manohar Filament', rating: 88, onTimeDelivery: 55, qualityScore: 95, responseTime: 60 },
    { name: 'F Pack', rating: 68, onTimeDelivery: 45, qualityScore: 55, responseTime: 60 },
    { name: 'Tech Star', rating: 90, onTimeDelivery: 55, qualityScore: 85, responseTime: 70 }
    ];
    
const SAMPLE_DELIVERY_DATA = {
    onTimePercentage: 75,
    latePercentage: 25,
    delayReasons: [
    { name: 'Embroidery', value: 60 },
    { name: 'Pattern Making ', value: 56 },
    { name: 'Finishing', value: 48 },
    { name: 'Sampling ', value: 44 },
    { name: 'Outsourcing Delay', value: 40 },
    ]
    };
    
const SAMPLE_TNA_DATA = [
    { name: 'Order Receipt (Buyer PO)', planned: '2024-01-15', actual: '2024-01-16', status: 'completed' },
    { name: 'CAD Consumption Received', planned: '2024-02-01', actual: '2024-02-05', status: 'completed' },
    { name: 'Pattern Making', planned: '2024-02-15', actual: '2024-02-14', status: 'completed' },
    { name: 'Sewing', planned: '2024-03-01', actual: '2024-03-03', status: 'completed' },
    { name: 'Embroidery', planned: '2024-03-15', actual: '2024-03-20', status: 'in-progress' },
    { name: 'Inspection', planned: '2024-04-01', actual: null, status: 'pending' },
    { name: 'Dispatch', planned: '2024-04-15', actual: null, status: 'pending' },
    ];
    
const SAMPLE_APPROVAL_DATA = [
    { month: 'Jan', approvalRate: 95 },
    { month: 'Feb', approvalRate: 67 },
    { month: 'Mar', approvalRate: 68 },
    { month: 'Apr', approvalRate: 75 },
    ];

    const APPROVAL_DATA = [
      { name: 'Hugo Boss', approval: 78 },
      { name: 'Arrow', approval: 92 },
      { name: 'US Polo', approval: 80 },
      { name: 'M&S', approval: 85 },
      { name: 'H&M', approval: 83 },
      { name: 'River Island', approval: 87 },
    ];
    
    // Data for Monthly On-Time Delivery Percentages
    const MONTHLY_DELIVERY_DATA = [
      { name: 'January', onTime: 71.33 },
      { name: 'February', onTime: 75.5 },
      { name: 'March', onTime: 85.71 },
      { name: 'April', onTime: 65 },
      { name: 'May', onTime: 74.39 },
    ];
    
    // Data for Brand-Specific On-Time Delivery Percentages
    const BRAND_DELIVERY_DATA = [
      { name: 'Arrow', onTime: 76 },
      { name: 'H&M', onTime: 66.14 },
      { name: 'Hugo Boss', onTime: 62 },
      { name: 'M&S', onTime: 80 },
      { name: 'River Island', onTime: 55 },
      { name: 'US Polo', onTime: 67.14 },
    ];    
// Color constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// 1. Supplier Ranking Chart
const SupplierRankingChart = ({ data = SAMPLE_SUPPLIER_DATA }) => {
  const sortedData = [...data].sort((a, b) => b.rating - a.rating);
  
  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">Supplier Ranking</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip formatter={(value) => [`${value}%`, 'Rating']} />
          <Legend />
          <Bar dataKey="rating" fill="#8884d8" name="Overall Rating" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. On-time Delivery Performance by Supplier
const OnTimeDeliveryChart = ({ data = SAMPLE_SUPPLIER_DATA }) => {
  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">On-time Delivery Performance by Supplier</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, 'On-Time Delivery']} />
          <Legend />
          <Bar dataKey="onTimeDelivery" fill="#82ca9d" name="On-Time Delivery %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Monthly On-time Delivery Percentage (Pie Chart)
const OnTimeDeliveryPieChart = ({ data = SAMPLE_DELIVERY_DATA }) => {
  const pieData = [
    { name: 'On Time', value: data.onTimePercentage },
    { name: 'Late', value: data.latePercentage }
  ];
  
  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, percent, name } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy} dy={8} className="pie-active-shape-text">
          {`${name}: ${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">Monthly On-time Delivery Percentage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Major Reasons for Delays Chart
const DelayReasonsChart = ({ data = SAMPLE_DELIVERY_DATA }) => {
  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">Major Reasons for Delays</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.delayReasons}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
          dataKey="name" 
          tick={({ x, y, payload }) => {
            const lines = payload.value.split(' '); // Split text into multiple lines
            return (
              <g transform={`translate(${x},${y + 10})`}>
                {lines.map((line, index) => (
                  <text 
                    key={index} 
                    x={1} 
                    y={index * 12} // Adjust line spacing
                    textAnchor="middle" 
                    fontSize={12}
                    top={10} // Adjust vertical alignment
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          }}
          interval={0} // Ensures all labels are displayed
          />          
          <YAxis />
          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
          <Legend />
          <Bar dataKey="value" fill="#FF8042" name="Percentage" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
// 5. TNA Milestones Timeline
const TNAMilestonesChart = ({ data = SAMPLE_TNA_DATA }) => {
  const processedData = data.map(item => {
    const plannedDate = new Date(item.planned).getTime();
    const actualDate = item.actual ? new Date(item.actual).getTime() : null;
    return {
      ...item,
      plannedTimestamp: plannedDate,
      actualTimestamp: actualDate,
      delay: actualDate ? (actualDate - plannedDate) / (1000 * 60 * 60 * 24) : 0
    };
  });

  const minDate = Math.min(...processedData.map(d => d.plannedTimestamp));
  const maxDate = Math.max(...processedData.map(d => 
    d.actualTimestamp ? d.actualTimestamp : d.plannedTimestamp
  ));

  const chartData = processedData.map((item, index) => ({
    name: item.name,
    planned: item.plannedTimestamp,
    actual: item.actualTimestamp,
    index
  }));

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  };


  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">TNA Milestones Timeline</h2>
      {/* <div className="table-container">
        <table className="milestones-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header-cell">Milestone</th>
              <th className="table-header-cell">Planned Date</th>
              <th className="table-header-cell">Actual Date</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Delay (Days)</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                <td className="table-cell">{item.name}</td>
                <td className="table-cell">{item.planned}</td>
                <td className="table-cell">{item.actual || '-'}</td>
                <td className="table-cell">
                  <span className={`status-badge ${
                    item.status === 'completed' ? 'status-badge-completed' : 
                    item.status === 'in-progress' ? 'status-badge-in-progress' : 'status-badge-pending'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="table-cell">
                  {item.delay > 0 ? (
                    <span className="delay-positive">{item.delay}</span>
                  ) : item.delay < 0 ? (
                    <span className="delay-negative">{Math.abs(item.delay)}</span>
                  ) : item.actual ? (
                    <span>0</span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
      <div className="tna-chart-area">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
            />
            <YAxis 
              type="number" 
              domain={[minDate, maxDate]} 
              tickFormatter={formatDate}
              label={{ value: 'Date', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => [formatDate(value), 'Date']}
              labelFormatter={(value) => `Milestone: ${value}`}
            />
            <Legend />
            <Area type="monotone" dataKey="planned" fill="#8884d8" stroke="#8884d8" name="Planned Date" />
            <Line type="monotone" dataKey="actual" stroke="#ff7300" name="Actual Date" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 6. Trend of Approval Rates Over Time
const ApprovalRatesTrendChart = ({ data = SAMPLE_APPROVAL_DATA }) => {
  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">Trend of Approval Rates Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="approvalRate" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Approval Rate %"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ApprovalChart = ({ data = APPROVAL_DATA }) => (
  <div className="chart-wrapper">
    <h2 className="chart-title">Sample Approval Rates</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="approval"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, approval }) => `${name}: ${approval}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
// Chart for Monthly On-Time Delivery Percentages
const MonthlyDeliveryChart = ({ data = MONTHLY_DELIVERY_DATA }) => (
  <div className="chart-wrapper">
    <h2 className="chart-title">Monthly On-Time Delivery Percentages</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value}%`, 'On-Time Delivery']} />
        <Legend />
        <Bar dataKey="onTime" fill="#8884d8" name="On-Time %" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const BrandDeliveryChart = ({ data = BRAND_DELIVERY_DATA }) => (
  <div className="chart-wrapper">
    <h2 className="chart-title">Brand-Specific On-Time Delivery Percentages</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="onTime"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, onTime }) => `${name}: ${onTime}%`}
        >
         {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'On-Time Delivery']} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);


// Main Dashboard Component
const SupplierDashboard = () => {
  const [supplierData, setSupplierData] = useState(SAMPLE_SUPPLIER_DATA);
  const [deliveryData, setDeliveryData] = useState(SAMPLE_DELIVERY_DATA);
  const [tnaData, setTnaData] = useState(SAMPLE_TNA_DATA);
  const [approvalData, setApprovalData] = useState(SAMPLE_APPROVAL_DATA);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Performance Dashboard</h1>
      
      <div className="dashboard-grid">
        {/* <div>
          <SupplierRankingChart data={supplierData} />
          {/* <OnTimeDeliveryPieChart data={deliveryData} /> 
        </div> */}
        <div>
          <ApprovalRatesTrendChart data={approvalData} />

          </div>
        {/* <div>
          <OnTimeDeliveryChart data={supplierData} />
          </div> */}
          <div>
          <DelayReasonsChart data={deliveryData} />
          </div>
          <div><TNAMilestonesChart data={tnaData} /></div>
        <div>
          <ApprovalChart data={APPROVAL_DATA} />
        </div>
        <div>
        <MonthlyDeliveryChart data={MONTHLY_DELIVERY_DATA} />
        </div>
        <div>
        <BrandDeliveryChart data={BRAND_DELIVERY_DATA} />
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;