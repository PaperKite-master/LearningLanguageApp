import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Custom Tooltip for Recharts to match the dark theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#1c2035', padding: '10px 15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>{`Điểm: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color, margin: 0, fontSize: '0.85rem' }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboardContent = () => {

  // ---------------------------------------------------------
  // MOCK DATABASE STATE (Ready for API Integration)
  // ---------------------------------------------------------
  const [data, setData] = useState({
    summary: {
      totalUsers: "2,847",
      totalUsersGrowth: "+12%",
      premiumUsers: "1,204",
      premiumUsersGrowth: "+8%",
      completedLessons: "15,382",
      completedLessonsGrowth: "+23%",
      flashcardsCreated: "8,941",
      flashcardsCreatedGrowth: "+15%"
    },
    // Mock sequential data for line/area chart
    growthChart: [
      { name: '1', thángthanh: 120, thángtrước: 80 },
      { name: '2', thángthanh: 130, thángtrước: 90 },
      { name: '3', thángthanh: 140, thángtrước: 100 },
      { name: '4', thángthanh: 180, thángtrước: 110 },
      { name: '5', thángthanh: 150, thángtrước: 90 },
      { name: '6', thángthanh: 160, thángtrước: 100 },
      { name: '7', thángthanh: 190, thángtrước: 120 },
      { name: '8', thángthanh: 180, thángtrước: 130 },
      { name: '9', thángthanh: 230, thángtrước: 120 },
      { name: '10', thángthanh: 210, thángtrước: 150 },
      { name: '11', thángthanh: 328, thángtrước: 215 },
    ],
    // Mock categorical data for Bar chart
    activityChart: [
      { name: 'T2', bàiHọc: 110, flashcard: 60 },
      { name: 'T3', bàiHọc: 140, flashcard: 70 },
      { name: 'T4', bàiHọc: 190, flashcard: 110 },
      { name: 'T5', bàiHọc: 130, flashcard: 90 },
      { name: 'T6', bàiHọc: 160, flashcard: 100 },
      { name: 'T7', bàiHọc: 230, flashcard: 150 },
      { name: 'CN', bàiHọc: 215, flashcard: 120 },
    ]
  });

  return (
    <div className="admin-content-area">
      <div className="admin-header">
        <h1 className="admin-heading">TỔNG QUAN</h1>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-title">Tổng số người dùng</span>
          <div className="admin-stat-value">{data.summary.totalUsers}</div>
          <div className="admin-stat-growth">{data.summary.totalUsersGrowth} so với tháng trước</div>
        </div>

        <div className="admin-stat-card">
          <span className="admin-stat-title">Người dùng mua gói</span>
          <div className="admin-stat-value">{data.summary.premiumUsers}</div>
          <div className="admin-stat-growth">{data.summary.premiumUsersGrowth} so với tháng trước</div>
        </div>

        <div className="admin-stat-card">
          <span className="admin-stat-title">Bài học đã hoàn thành</span>
          <div className="admin-stat-value">{data.summary.completedLessons}</div>
          <div className="admin-stat-growth">{data.summary.completedLessonsGrowth} so với tháng trước</div>
        </div>

        <div className="admin-stat-card">
          <span className="admin-stat-title">Flashcard đã tạo</span>
          <div className="admin-stat-value">{data.summary.flashcardsCreated}</div>
          <div className="admin-stat-growth">{data.summary.flashcardsCreatedGrowth} so với tháng trước</div>
        </div>
      </div>

      {/* 2 Big Chart Panels */}
      <div className="admin-charts-grid">
        
        {/* Left Area Chart */}
        <div className="admin-chart-panel">
          <h3 className="admin-chart-title">TĂNG TRƯỞNG NGƯỜI DÙNG</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growthChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {/* Defs to create gradient fills */}
                <defs>
                  <linearGradient id="colorThisMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLastMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* X Axis hidden for minimalism to match drawing */}
                <XAxis dataKey="name" hide={true} />
                <YAxis hide={true} />
                
                <Area 
                  type="monotone" 
                  dataKey="thángtrước" 
                  name="Tháng trước"
                  stroke="#00e5ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorLastMonth)" 
                  activeDot={{ r: 6 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="thángthanh" 
                  name="Tháng này"
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorThisMonth)" 
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-legend-bottom">
            <div className="legend-item">
              <span className="legend-dot" style={{backgroundColor: '#00e5ff'}}></span>
              <div className="legend-text">
                <span className="legend-label">Tháng trước</span>
                <span className="legend-num">215</span>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{backgroundColor: '#10b981'}}></span>
              <div className="legend-text">
                <span className="legend-label">Tháng này</span>
                <span className="legend-num">328</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bar Chart */}
        <div className="admin-chart-panel">
          <h3 className="admin-chart-title">HOẠT ĐỘNG HÀNG NGÀY</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" hide={true} />
                <YAxis hide={true} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                
                <Bar dataKey="bàiHọc" name="Bài học" fill="#0284c7" radius={[2, 2, 0, 0]} barSize={12} />
                <Bar dataKey="flashcard" name="Flashcard" fill="#00e5ff" radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-legend-bottom">
            <div className="legend-item">
              <span className="legend-dot" style={{backgroundColor: '#0284c7'}}></span>
              <div className="legend-text">
                <span className="legend-label">Bài học</span>
                <span className="legend-num">215</span>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{backgroundColor: '#00e5ff'}}></span>
              <div className="legend-text">
                <span className="legend-label">Flashcard</span>
                <span className="legend-num">328</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardContent;
