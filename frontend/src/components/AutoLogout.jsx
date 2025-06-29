import { useEffect } from 'react';
import axios from '../../utils/axios'; 
import { useNavigate } from 'react-router-dom';

const AutoLogout = ({ children, timeout = 5 * 60 * 1000 }) => {
  const navigate = useNavigate();
  let timer;

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, timeout);
    };

    const logout = async () => {
      try {
        await axios.post('/auth/logout');
      } catch (err) {
        console.error('Auto logout error:', err);
      }
      localStorage.removeItem('user');
      navigate('/login');
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // bắt đầu đếm ngay khi vào

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [navigate, timeout]);

  return children;
};

export default AutoLogout;
