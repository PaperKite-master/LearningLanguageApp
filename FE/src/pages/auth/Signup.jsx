import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Eye, EyeOff, Target, ChevronDown, KeyRound, Lock } from 'lucide-react';
import authApi from '../../api/authApi';
import Header from '../../components/Header';
import computer from '../../assets/computer.png';
import './Auth.css';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path fill="none" d="M1 1h22v22H1z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#1d4ed8">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="16" height="16" fill="#000000">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.8 8 273.5q-9 53.5 32.7 131.5c24 45.3 53.3 93 103 91.5 49.3-1.6 63.4-30.8 119.5-30.8 55.6 0 68 30.8 119.5 30.8 51.5 0 77.2-44.1 101.4-89.9 31.2-59 42.7-111 44.5-113.8-1.5-1-49.9-19.5-50.5-94.2zm-127.3-176c24.5-29.3 40.1-71.1 35.6-112.5-35.7 1.4-81 23.5-106.6 52.8-20.4 23.4-39.1 66.8-33.8 107.5 40.5 3.1 84-21.7 104.8-47.8z"/>
  </svg>
);

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    email: '',
    targetLevel: 'N5'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const targetOptions = [
    { value: 'N5', label: 'Mục tiêu: N5 (Sơ cấp 1)' },
    { value: 'N4', label: 'Mục tiêu: N4 (Sơ cấp 2)' },
    { value: 'N3', label: 'Mục tiêu: N3 (Trung cấp)' },
    { value: 'N2', label: 'Mục tiêu: N2 (Cao cấp 1)' },
    { value: 'N1', label: 'Mục tiêu: N1 (Cao cấp 2)' }
  ];

  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Họ và tên không được để trống";
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,32}$/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải từ 8-32 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    if (!formData.email.trim()) newErrors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const payload = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: "USER",
          targetLevel: formData.targetLevel
        };
        await authApi.register(payload);
        setStep('otp');
      } catch (error) {
        console.error('Registration failed:', error);
        setErrors({ submit: error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrors({ otp: "Vui lòng nhập đúng mã OTP" });
      return;
    }
    
    setIsLoading(true);
    try {
      await authApi.verifyOtp({
        email: formData.email,
        token: otpCode,
        type: 'signup'
      });
      alert('Xác thực email thành công! Đang chuyển hướng...');
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP Verification failed:', error);
      setErrors({ otp: error.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/`;
    window.location.href = `https://ohhddvagmhlylklypknj.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="auth-page-container">
      <Header hideActions />
      
      <main className="auth-main-content">
        
        {/* Left Column - Illustration */}
        <div className="auth-left-column">
          <img 
            src={computer} 
            alt="HiNa Digital Learning" 
            className="auth-illustration" 
          />
        </div>
        
        {/* Right Column - Form */}
        <div className="auth-right-column">
          <div className="auth-form-container">
            <h1 className="auth-heading">CHÀO MỪNG ĐẾN VỚI<br />HINA!</h1>
            <div className="auth-desc">Nền tảng ngôn ngữ được thiết kế riêng cho các lập trình viên.</div>
            
            {step === 'form' ? (
              <>
                <div className="auth-social-buttons">
                  <button type="button" className="auth-social-btn google" onClick={handleGoogleLogin}>
                    <div className="social-icon"><GoogleIcon /></div>
                    Đăng ký bằng Google
                  </button>
                  
                  <button type="button" className="auth-social-btn facebook" onClick={() => alert('Đăng ký bằng Facebook chưa được cấu hình')}>
                    <div className="social-icon"><FacebookIcon /></div>
                    Đăng ký bằng Facebook
                  </button>

                  <button type="button" className="auth-social-btn apple" onClick={() => alert('Đăng ký bằng Apple chưa được cấu hình')}>
                    <div className="social-icon"><AppleIcon /></div>
                    Đăng ký với Apple
                  </button>
                </div>
                
                <div className="auth-divider">
                  <span className="auth-divider-text">or register with</span>
                </div>

                {errors.submit && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{errors.submit}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="auth-input-group">
                    <label className="auth-input-label">Họ và tên</label>
                    <div className="auth-input-wrapper">
                      <User className="auth-input-icon" size={20} />
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="auth-input" 
                        placeholder="Nhập họ và tên" 
                        style={{ borderColor: errors.fullName ? '#ef4444' : '' }}
                      />
                    </div>
                    {errors.fullName && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px' }}>{errors.fullName}</div>}
                  </div>
                  
                  <div className="auth-input-group">
                    <label className="auth-input-label">Email</label>
                    <div className="auth-input-wrapper">
                      <Mail className="auth-input-icon" size={20} />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="auth-input" 
                        placeholder="Nhập địa chỉ email" 
                        style={{ borderColor: errors.email ? '#ef4444' : '' }}
                      />
                    </div>
                    {errors.email && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px' }}>{errors.email}</div>}
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-input-label">Mật khẩu</label>
                    <div className="auth-input-wrapper">
                      <Lock className="auth-input-icon" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="auth-input" 
                        placeholder="Nhập mật khẩu" 
                        style={{ borderColor: errors.password ? '#ef4444' : '' }}
                      />
                      <button 
                        type="button" 
                        className="auth-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px' }}>{errors.password}</div>}
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-input-label">Xác nhận mật khẩu</label>
                    <div className="auth-input-wrapper">
                      <Lock className="auth-input-icon" size={20} />
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="auth-input" 
                        placeholder="Nhập lại mật khẩu" 
                        style={{ borderColor: errors.confirmPassword ? '#ef4444' : '' }}
                      />
                      <button 
                        type="button" 
                        className="auth-password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex="-1"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px' }}>{errors.confirmPassword}</div>}
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-input-label">Mục tiêu học tập</label>
                    <div className="auth-input-wrapper" style={{ cursor: 'pointer' }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                      <Target className="auth-input-icon" size={20} />
                      <div className="auth-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '20px' }}>
                        <span>{targetOptions.find(opt => opt.value === formData.targetLevel)?.label}</span>
                        <ChevronDown size={18} color="#6b7280" style={{ transition: 'transform 0.3s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                      </div>
                      
                      {isDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: 'calc(100% + 5px)',
                          left: 0,
                          right: 0,
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          zIndex: 50,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}>
                          {targetOptions.map((option) => (
                            <div 
                              key={option.value}
                              style={{
                                padding: '12px 20px',
                                color: formData.targetLevel === option.value ? '#371089' : '#1F174D',
                                backgroundColor: formData.targetLevel === option.value ? '#f3e8ff' : 'transparent',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                fontSize: '0.95rem',
                                fontWeight: formData.targetLevel === option.value ? 'bold' : 'normal'
                              }}
                              onMouseEnter={(e) => {
                                if (formData.targetLevel !== option.value) e.target.style.backgroundColor = '#f8fafc';
                              }}
                              onMouseLeave={(e) => {
                                if (formData.targetLevel !== option.value) e.target.style.backgroundColor = 'transparent';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({ ...prev, targetLevel: option.value }));
                                setIsDropdownOpen(false);
                              }}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button type="submit" className="auth-submit-btn" disabled={isLoading} style={{ marginTop: '10px' }}>
                    {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </button>
                </form>
                
                <div className="auth-footer-text">
                  Đã có tài khoản rồi? <Link to="/login" className="auth-footer-link">Đăng nhập lại</Link>
                </div>
              </>
            ) : (
              <div className="otp-container" style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Chúng tôi đã gửi một mã OTP đến email <strong>{formData.email}</strong>. Vui lòng kiểm tra hộp thư (cả mục Spam) và nhập mã vào bên dưới để hoàn tất đăng ký.
                </p>
                
                {errors.otp && <div style={{ color: '#ef4444', marginBottom: '15px' }}>{errors.otp}</div>}
                
                <form onSubmit={handleVerifyOtp}>
                  <div className="auth-input-group">
                    <div className="auth-input-wrapper">
                      <KeyRound className="auth-input-icon" size={20} />
                      <input 
                        type="text" 
                        maxLength="8"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ''));
                          if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                        }}
                        className="auth-input" 
                        placeholder="Nhập mã OTP" 
                        style={{ 
                          textAlign: 'center', 
                          letterSpacing: '4px', 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          paddingLeft: '48px',
                          borderColor: errors.otp ? '#ef4444' : '#e2e8f0'
                        }}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="auth-submit-btn" disabled={isLoading || otpCode.length < 6}>
                    {isLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="auth-submit-btn" 
                    style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}
                    onClick={() => setStep('form')}
                    disabled={isLoading}
                  >
                    Quay lại
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Signup;
