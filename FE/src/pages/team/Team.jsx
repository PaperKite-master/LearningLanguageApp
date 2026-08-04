import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Header from '../../components/Header';
import quynhAnh from '../../assets/team/quynh-anh.jpg';
import nhuQuynh from '../../assets/team/nhu-quynh.jpg';
import ngocThao from '../../assets/team/ngoc-thao.jpg';
import tuanKiet from '../../assets/team/tuan-kiet.jpg';
import vanDung from '../../assets/team/van-dung.jpg';
import ducTruong from '../../assets/team/duc-truong.jpg';
import './Team.css';

const TEAM_MEMBERS = [
  { name: 'Hoàng Thị Quỳnh Anh', studentId: 'SE183288', photo: quynhAnh },
  { name: 'Văn Thị Như Quỳnh', studentId: 'SA170111', photo: nhuQuynh },
  { name: 'Chu Ngọc Thảo', studentId: 'SA180250', photo: ngocThao },
  { name: 'Nguyễn Tuấn Kiệt', studentId: 'SE182120', photo: tuanKiet },
  { name: 'Nguyễn Văn Dũng', studentId: 'SE184094', photo: vanDung },
  { name: 'Nguyễn Lê Đức Trường', studentId: 'SE173600', photo: ducTruong },
];

const Team = () => {
  return (
    <div className="team-page">
      <TopBar />
      <Header />

      <main className="team-main">
        <div className="team-hero">
          <p className="team-eyebrow">Về chúng tôi</p>
          <h1 className="team-title">Đội ngũ HiNa</h1>
          <p className="team-subtitle">
            Những người đồng hành xây dựng nền tảng học tiếng Nhật chuyên ngành IT.
          </p>
        </div>

        <div className="team-grid">
          {TEAM_MEMBERS.map((member) => (
            <article key={member.studentId} className="team-card">
              <div className="team-photo-frame">
                <img src={member.photo} alt={member.name} className="team-photo" />
              </div>
              <div className="team-badge">
                <span className="team-name">{member.name}</span>
                <span className="team-id">{member.studentId}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="team-back">
          <Link to="/" className="team-back-link">
            ← Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Team;
