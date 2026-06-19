import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Header from '../../components/Header';
import BackgroundLayer from '../../components/BackgroundLayer';
import computer from '../../assets/computer.png';
import './LandingPage.css';
import { BookOpen, Cpu, Award, Target, Calendar, HandCoins, ClipboardCheck, Check, Facebook, Twitter, Instagram, Github } from 'lucide-react';

const LandingPage = () => {
  const getAuthLink = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      return u?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
    } catch(e) { return '/dashboard'; }
  };

  const getAuthText = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      return u?.role === 'ADMIN' ? 'Vào trang quản lý' : 'Tiếp tục học';
    } catch(e) { return 'Tiếp tục học'; }
  };

  const isAuth = !!localStorage.getItem('accessToken');

  return (
    <div className="landing-page-container">
      
      <div className="landing-content-wrapper">
        <TopBar />
        <Header />
        
        {/* ================= HERO SECTION ================= */}
        <section className="lp-hero-section">
          <BackgroundLayer />
          <div className="lp-hero-container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="lp-hero-content">
              <h1 className="lp-hero-title">
                THÀNH THẠO TIẾNG NHẬT<br/>
                <span className="lp-hero-title-gradient">CHUYÊN NGÀNH IT</span>
              </h1>
              
              <ul className="lp-hero-description">
                <li>Nền tảng ngôn ngữ được thiết kế riêng cho các lập trình viên.</li>
                <li>Hãy chinh phục công việc mơ ước tại các công ty công nghệ hàng đầu Nhật Bản với vốn từ vựng chuyên ngành, kính ngữ trong kinh doanh, và sự chuẩn bị cho phỏng vấn kỹ thuật.</li>
              </ul>
              
              {isAuth ? (
                <Link to={getAuthLink()} className="lp-btn">
                  {getAuthText()}
                </Link>
              ) : (
                <Link to="/signup" className="lp-btn">
                  Bắt đầu ngay
                </Link>
              )}
            </div>
            
            <div className="lp-hero-image">
              <img src={computer} alt="HiNa Digital Learning Platform" />
            </div>
          </div>
        </section>

        {/* ================= LEARNING PATH SECTION ================= */}
        <section className="lp-section lp-path-section">
          <div className="lp-container">
            <div className="lp-timeline-tag" style={{ width: 'fit-content', margin: '0 auto 15px', background: '#e0e7ff', color: '#4338ca', padding: '6px 16px', fontSize: '0.9rem' }}>LỘ TRÌNH HỌC TẬP</div>
            <h2 className="lp-section-title">LỘ TRÌNH CỦA BẠN DẪN ĐẾN<br/>SỰ TRÔI CHẢY</h2>
            <p className="lp-section-subtitle">
              Với chương trình học có cấu trúc, được thiết kế riêng cho các lập trình viên IT, HINA tin tưởng sẽ mang đến cho bạn lộ trình hoàn thiện kỹ năng tốt nhất!
            </p>

            <div className="lp-timeline">
              {/* Step 1 */}
              <div className="lp-timeline-item">
                <div className="lp-timeline-icon">1</div>
                <div className="lp-timeline-content">
                  <div className="lp-timeline-card-header">
                    <BookOpen size={24} color="#818cf8" />
                    <span className="lp-timeline-tag">Nền tảng</span>
                  </div>
                  <h3 className="lp-timeline-title">Xây dựng kiến thức cơ bản</h3>
                  <p className="lp-timeline-desc">Học và làm quen với hệ thống bảng chữ cái Nhật Bản, nắm vững ngữ pháp, từ vựng cơ bản.</p>
                  <div className="lp-timeline-tags">
                    <span className="lp-timeline-small-tag">Bảng chữ cái</span>
                    <span className="lp-timeline-small-tag">Từ vựng N5-N4</span>
                    <span className="lp-timeline-small-tag">Ngữ pháp</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="lp-timeline-item">
                <div className="lp-timeline-icon">2</div>
                <div className="lp-timeline-content">
                  <div className="lp-timeline-card-header">
                    <Cpu size={24} color="#818cf8" />
                    <span className="lp-timeline-tag">Chuyên sâu</span>
                  </div>
                  <h3 className="lp-timeline-title">Từ vựng chuyên ngành IT</h3>
                  <p className="lp-timeline-desc">Làm quen với các thuật ngữ lập trình, tài liệu kỹ thuật, vòng đời phát triển phần mềm bằng tiếng Nhật.</p>
                  <div className="lp-timeline-tags">
                    <span className="lp-timeline-small-tag">Thuật ngữ lập trình</span>
                    <span className="lp-timeline-small-tag">Đọc tài liệu</span>
                    <span className="lp-timeline-small-tag">Viết báo cáo</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="lp-timeline-item">
                <div className="lp-timeline-icon">3</div>
                <div className="lp-timeline-content">
                  <div className="lp-timeline-card-header">
                    <Target size={24} color="#818cf8" />
                    <span className="lp-timeline-tag">Kỹ năng</span>
                  </div>
                  <h3 className="lp-timeline-title">Giao tiếp công sở & Kính ngữ</h3>
                  <p className="lp-timeline-desc">Học cách ứng xử, viết email, tham gia meeting, báo cáo tiến độ bằng Keigo (Kính ngữ) chuyên nghiệp.</p>
                  <div className="lp-timeline-tags">
                    <span className="lp-timeline-small-tag">Keigo</span>
                    <span className="lp-timeline-small-tag">Email doanh nghiệp</span>
                    <span className="lp-timeline-small-tag">Kỹ năng Meeting</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="lp-timeline-item">
                <div className="lp-timeline-icon">4</div>
                <div className="lp-timeline-content">
                  <div className="lp-timeline-card-header">
                    <Award size={24} color="#818cf8" />
                    <span className="lp-timeline-tag">Ứng dụng</span>
                  </div>
                  <h3 className="lp-timeline-title">Mô phỏng phỏng vấn IT</h3>
                  <p className="lp-timeline-desc">Chuẩn bị sẵn sàng cho buổi phỏng vấn xin việc với các công ty IT hàng đầu Nhật Bản.</p>
                  <div className="lp-timeline-tags">
                    <span className="lp-timeline-small-tag">Phỏng vấn Kỹ thuật</span>
                    <span className="lp-timeline-small-tag">Phỏng vấn Nhân sự</span>
                    <span className="lp-timeline-small-tag">CV & Portfolio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section className="lp-section lp-features-section">
          <div className="lp-container">
            <div className="lp-features-card">
              <div className="lp-features-content">
                <h2 className="lp-features-title">TẠI SAO NÊN<br/>CHỌN HINA ?</h2>
                <ul className="lp-features-desc" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                  <li>HINA có lộ trình học chuẩn chuyên ngành IT, bạn sẽ học và làm trên một nền tảng thực tế.</li>
                  <li>Lộ trình cá nhân hóa, bạn dễ dàng tiếp thu mọi kiến thức một cách nhanh chóng.</li>
                </ul>
              </div>
              
              <div className="lp-features-grid">
                <div className="lp-feature-item">
                  <div className="lp-feature-icon">
                    <Calendar color="#4f46e5" size={40} />
                  </div>
                  <div className="lp-feature-name">Lịch học<br/>linh hoạt và thuận tiện</div>
                </div>
                
                <div className="lp-feature-item">
                  <div className="lp-feature-icon">
                    <HandCoins color="#10b981" size={40} />
                  </div>
                  <div className="lp-feature-name">Học phí<br/>hợp lý</div>
                </div>
                
                <div className="lp-feature-item">
                  <div className="lp-feature-icon">
                    <ClipboardCheck color="#8b5cf6" size={40} />
                  </div>
                  <div className="lp-feature-name">Kiểm tra và<br/>đánh giá định kỳ</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRICING SECTION ================= */}
        <section className="lp-section lp-pricing-section">
          <div className="lp-container">
            <h2 className="lp-section-title">ĐẦU TƯ VÀO <span style={{ color: '#824FD3' }}>SỰ NGHIỆP</span> CỦA BẠN</h2>
            <p className="lp-section-subtitle">Chính sách giá phù hợp cho nhiều đối tượng, cam kết chất lượng</p>

            <div className="lp-pricing-grid">
              {/* STUDENT */}
              <div className="lp-pricing-card">
                <div className="lp-pricing-name">STUDENT</div>
                <div className="lp-pricing-desc">Gói hỗ trợ sinh viên học cơ bản, giúp tiếp cận với tiếng Nhật trong môi trường IT</div>
                <div className="lp-pricing-price">0Đ / THÁNG</div>
                <button className="lp-pricing-btn">Miễn phí</button>
                <ul className="lp-pricing-features">
                  <li><Check size={18} /> Học ngữ pháp và từ vựng cơ bản</li>
                  <li><Check size={18} /> Từ vựng chuyên ngành (Giới hạn)</li>
                  <li><Check size={18} /> Ôn tập bằng Flashcard (Cơ bản)</li>
                  <li><Check size={18} /> Kiểm tra tiến độ học tập (Cơ bản)</li>
                </ul>
              </div>

              {/* PRO */}
              <div className="lp-pricing-card pro">
                <div className="lp-timeline-tag" style={{ position: 'absolute', top: '-15px', right: '30px', background: '#371089' }}>Được đề xuất</div>
                <div className="lp-pricing-name">PRO</div>
                <div className="lp-pricing-desc">Gói nâng cao cho Kỹ sư IT thực thụ, mở khóa toàn bộ tính năng và bài học chuyên sâu</div>
                <div className="lp-pricing-price">99.000Đ / THÁNG</div>
                <button className="lp-pricing-btn">Đăng ký ngay</button>
                <ul className="lp-pricing-features">
                  <li><Check size={18} /> Mở khóa tất cả bài học</li>
                  <li><Check size={18} /> Từ vựng chuyên ngành kỹ thuật sâu</li>
                  <li><Check size={18} /> Kính ngữ giao tiếp doanh nghiệp</li>
                  <li><Check size={18} /> Phỏng vấn mô phỏng với AI</li>
                  <li><Check size={18} /> Bài tập đọc hiểu tài liệu dự án IT</li>
                  <li><Check size={18} /> Theo dõi tiến độ nâng cao (Phân tích)</li>
                  <li><Check size={18} /> Hỗ trợ từ giáo viên 24/7</li>
                </ul>
              </div>

              {/* ENTERPRISE */}
              <div className="lp-pricing-card">
                <div className="lp-pricing-name">DOANH NGHIỆP</div>
                <div className="lp-pricing-desc">Đào tạo đội ngũ nhân sự CNTT của công ty làm việc trực tiếp với đối tác Nhật Bản</div>
                <div className="lp-pricing-price" style={{ fontSize: '1.8rem', paddingTop: '10px' }}>TÙY CHỈNH</div>
                <button className="lp-pricing-btn" style={{ marginTop: '10px' }}>Liên hệ ngay</button>
                <ul className="lp-pricing-features">
                  <li><Check size={18} /> Bao gồm tất cả tính năng PRO</li>
                  <li><Check size={18} /> Thiết kế bài tập theo dự án thực tế</li>
                  <li><Check size={18} /> Quản lý và theo dõi nhóm nhân viên</li>
                  <li><Check size={18} /> Cấp tài khoản hàng loạt cho Team</li>
                  <li><Check size={18} /> API Tích hợp hệ thống quản lý nội bộ</li>
                  <li><Check size={18} /> Đào tạo chuyên sâu qua Webinar Nhóm</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA SECTION ================= */}
        <section className="lp-cta-section">
          <div className="lp-container">
            <div className="lp-cta-card">
              <h2 className="lp-cta-title">BẠN ĐÃ SẴN SÀNG<br/>NÂNG CẤP KỸ NĂNG CHƯA?</h2>
              <p className="lp-cta-desc">Tham gia cùng hàng ngàn Kỹ sư IT khác trên nền tảng giáo dục chuyên biệt của HINA. Bắt đầu hành trình chinh phục tiếng Nhật cho IT ngay từ hôm nay!</p>
              
              {isAuth ? (
                <Link to={getAuthLink()} className="lp-btn" style={{ padding: '15px 40px', fontSize: '1.2rem' }}>
                  {getAuthText()}
                </Link>
              ) : (
                <Link to="/signup" className="lp-btn" style={{ padding: '15px 40px', fontSize: '1.2rem' }}>
                  Bắt đầu ngay hôm nay
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="lp-footer">
          <div className="lp-footer-container">
            <div className="lp-footer-col">
              <div className="lp-footer-logo">
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: '2.5rem', color: 'white', letterSpacing: '2px' }}>
                  H<span style={{ color: '#DD76F7' }}>i</span>N<span style={{ color: '#818cf8' }}>a</span>
                </h2>
              </div>
              <p style={{ opacity: 0.8, marginBottom: '20px', lineHeight: '1.6' }}>
                Nền tảng học Tiếng Nhật hàng đầu dành riêng cho Kỹ sư và sinh viên chuyên ngành Công Nghệ Thông Tin.
              </p>
              <div className="lp-footer-social">
                <a href="#"><Facebook size={20} /></a>
                <a href="#"><Twitter size={20} /></a>
                <a href="#"><Instagram size={20} /></a>
                <a href="#"><Github size={20} /></a>
              </div>
            </div>
            
            <div className="lp-footer-col">
              <h3 className="lp-footer-title">Khám phá HINA</h3>
              <ul className="lp-footer-links">
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/study/lessons">Khóa học IT</Link></li>
                <li><Link to="/games">Trò chơi ôn tập</Link></li>
                <li><Link to="/leaderboard">Bảng xếp hạng</Link></li>
              </ul>
            </div>
            
            <div className="lp-footer-col">
              <h3 className="lp-footer-title">Về chúng tôi</h3>
              <ul className="lp-footer-links">
                <li><a href="#">Giới thiệu</a></li>
                <li><a href="#">Đội ngũ</a></li>
                <li><a href="#">Tuyển dụng</a></li>
                <li><a href="#">Liên hệ</a></li>
              </ul>
            </div>
            
            <div className="lp-footer-col">
              <h3 className="lp-footer-title">Hỗ trợ khách hàng</h3>
              <ul className="lp-footer-links">
                <li><a href="#">Điều khoản sử dụng</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
                <li><a href="#">Hướng dẫn thanh toán</a></li>
                <li><a href="#">Hỏi đáp thường gặp</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&copy; {new Date().getFullYear()} HINA - Tiếng Nhật Chuyên Ngành IT. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
