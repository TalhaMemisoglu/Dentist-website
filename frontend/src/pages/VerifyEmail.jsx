import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const VerifyEmail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/api/verify-email/${userId}/`);
      console.log('API Response:', response.data);
      alert('Email verified successfully!');
      window.close();
    } catch (error) {
      console.error('Error:', error.response || error.message);
      setError('Error verifying email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  React.useEffect(() => {
    verifyEmail();
  }, [userId]);

  if (loading) {
    return <div>Verifying your email...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Email verification successful! Redirecting...</div>;
};

export default VerifyEmail;
