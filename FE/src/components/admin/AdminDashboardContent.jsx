import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import adminDashboardApi from '../../api/adminDashboardApi';
import './AdminDashboardContent.css';

const AdminDashboardContent = () => {
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalUsers: "450",
      totalUsersGrowth: "Tăng 5% so với tháng trước",
      activeUsers: "50",
      activeUsersGrowth: "Tăng 3% so với tháng trước",
      revenue: "120Tr VNĐ",
      revenueGrowth: "Tăng 10% so với tháng trước",
      totalLessons: "50",
      totalLessonsGrowth: "Tăng 2% so với tháng trước"
    },
    // Mock sequential data for bar chart
    activityChart: [
      { name: 'Jan', value: 75 },
      { name: 'Feb', value: 85 },
      { name: 'Mar', value: 50 },
      { name: 'Apr', value: 92 },
      { name: 'May', value: 115 },
      { name: 'Jun', value: 85 },
      { name: 'Jul', value: 105 },
      { name: 'Aug', value: 95 },
      { name: 'Sep', value: 125 },
      { name: 'Oct', value: 80 },
      { name: 'Nov', value: 100 },
      { name: 'Dec', value: 85 },
    ],
    // Mock data for pie chart
    completionData: [
      { name: 'Completed', value: 45, color: '#0275d8' }, // Blue
      { name: 'In Progress', value: 35, color: '#e066ff' }, // Pink/Purple
      { name: 'Not Started', value: 20, color: '#ff0000' }  // Red
    ],
    // Mock data for area chart
    growthChart: [
      { name: 'Jan', value: 100 },
      { name: '', value: 120 },
      { name: '', value: 350 },
      { name: '', value: 250 },
      { name: '', value: 400 },
      { name: '', value: 280 },
      { name: 'Feb', value: 450 },
      { name: '', value: 300 },
      { name: '', value: 350 },
      { name: '', value: 320 },
      { name: '', value: 380 },
      { name: '', value: 350 },
      { name: '', value: 450 },
      { name: '', value: 420 },
      { name: '', value: 400 },
      { name: 'Mar', value: 420 }
    ]
  });

  useEffect(() => {
    // 1. Get Admin Name
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName || user.name) {
          setAdminName(user.fullName || user.name);
        }
      } catch (e) {}
    }

    // 2. Fetch Dashboard Data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminDashboardApi.getDashboardStats();
        if (response && response.data) {
          const payload = response.data.data || response.data;
          setData(payload);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="custom-legend">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="legend-item">
            <span className="legend-color-box" style={{ backgroundColor: entry.color }}></span>
            <span className="legend-text">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="admin-light-dashboard">
      <div className="admin-welcome-header">
        <h1>Chào mừng trở lại, <span className="highlight-name">{adminName}</span>!</h1>
        <p>Đây là tình hình hoạt động của khóa học của bạn hôm nay.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* 4 Summary Stats Cards */}
      <div className="admin-stats-grid-light">
        <div className="admin-stat-card-light">
          <span className="admin-stat-title-light">Số người học</span>
          <div className="admin-stat-value-light">{data.summary.totalUsers}</div>
          <div className="admin-stat-growth-light">{data.summary.totalUsersGrowth}</div>
        </div>

        <div className="admin-stat-card-light">
          <span className="admin-stat-title-light">Số người đang hoạt động</span>
          <div className="admin-stat-value-light">{data.summary.activeUsers}</div>
          <div className="admin-stat-growth-light">{data.summary.activeUsersGrowth}</div>
        </div>

        <div className="admin-stat-card-light">
          <span className="admin-stat-title-light">Tổng doanh thu</span>
          <div className="admin-stat-value-light">{data.summary.revenue}</div>
          <div className="admin-stat-growth-light">{data.summary.revenueGrowth}</div>
        </div>

        <div className="admin-stat-card-light">
          <span className="admin-stat-title-light">Tổng số bài học</span>
          <div className="admin-stat-value-light">{data.summary.totalLessons}</div>
          <div className="admin-stat-growth-light">{data.summary.totalLessonsGrowth}</div>
        </div>
      </div>

      {/* Top Bar Chart */}
      <div className="admin-full-chart-panel">
        <h3 className="admin-chart-title-light">Hoạt động học tập của học viên theo tháng</h3>
        <div className="chart-wrapper-large">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.activityChart} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2 Bottom Charts */}
      <div className="admin-charts-grid-light">
        
        {/* Left Pie Chart */}
        <div className="admin-chart-panel-light">
          <h3 className="admin-chart-title-light">Tỷ lệ hoàn thành khóa học</h3>
          <div className="pie-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend content={renderCustomLegend} layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Area Chart */}
        <div className="admin-chart-panel-light">
          <h3 className="admin-chart-title-light" style={{ textTransform: 'uppercase' }}>Tăng trưởng học viên</h3>
          <div className="area-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growthChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#e0f2fe" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="linear" 
                  dataKey="value" 
                  stroke="#7dd3fc" 
                  strokeWidth={0}
                  fillOpacity={1} 
                  fill="url(#colorGrowth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardContent;
