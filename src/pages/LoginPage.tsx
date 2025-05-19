
import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Para teste, você pode se registrar com um novo email.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
