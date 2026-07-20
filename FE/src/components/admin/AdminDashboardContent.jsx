import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import adminDashboardApi from '../../api/adminDashboardApi';
import './AdminDashboardContent.css';

const EMPTY_DASHBOARD = {
  summary: {
    totalUsers: '0',
    totalUsersGrowth: '',
    activeUsers: '0',
    activeUsersGrowth: '',
    revenue: '0 ₫',
    revenueGrowth: '',
    totalLessons: '0',
    totalLessonsGrowth: '',
  },
  activityChart: [],
  completionData: [],
  growthChart: [],
};

const AdminDashboardContent = () => {
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(EMPTY_DASHBOARD);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName || user.name) {
          setAdminName(user.fullName || user.name);
        }
      } catch (e) {}
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminDashboardApi.getDashboardStats();
        const payload = response?.data?.data || response?.data;
        if (payload) {
          setData(payload);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Không thể tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          {label ? <p className="tooltip-label">{label}</p> : null}
          <p className="label">{payload[0].value}</p>
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

  const hasActivityData = data.activityChart.some((item) => item.value > 0);
  const hasGrowthData = data.growthChart.some((item) => item.value > 0);

  return (
    <div className="admin-light-dashboard">
      <div className="admin-welcome-header">
        <h1>Chào mừng trở lại, <span className="highlight-name">{adminName}</span>!</h1>
        <p>Đây là tình hình hoạt động của khóa học của bạn hôm nay.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#ef4444' }}>{error}</div>
      ) : (
        <>
          <div className="admin-stats-grid-light">
            <div className="admin-stat-card-light">
              <span className="admin-stat-title-light">Số người học</span>
              <div className="admin-stat-value-light">{data.summary.totalUsers}</div>
              <div className="admin-stat-growth-light">{data.summary.totalUsersGrowth}</div>
            </div>

            <div className="admin-stat-card-light">
              <span className="admin-stat-title-light">Người hoạt động (30 ngày)</span>
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

          <div className="admin-full-chart-panel">
            <h3 className="admin-chart-title-light">Hoạt động học tập theo tháng (12 tháng gần nhất)</h3>
            <div className="chart-wrapper-large">
              {hasActivityData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activityChart} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-chart-empty">Chưa có hoạt động học tập nào.</div>
              )}
            </div>
          </div>

          <div className="admin-charts-grid-light">
            <div className="admin-chart-panel-light">
              <h3 className="admin-chart-title-light">Tiến độ học bài</h3>
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
                    <Tooltip formatter={(value, name) => [`${value} lượt`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-chart-panel-light">
              <h3 className="admin-chart-title-light">Học viên mới theo tháng</h3>
              <div className="area-chart-wrapper">
                {hasGrowthData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.growthChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#e0f2fe" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 500 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorGrowth)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="admin-chart-empty">Chưa có học viên mới.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardContent;
