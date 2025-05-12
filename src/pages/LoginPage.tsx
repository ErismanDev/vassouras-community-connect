
import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
