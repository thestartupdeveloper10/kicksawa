import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext'; // Import the useTheme hook

const SignUpPage = () => {
  const { theme } = useTheme(); // Use the theme hook
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(password === confirmPassword) {
      console.log('Sign up attempt with:', { name, email, password, confirmPassword });
    } else {
      console.log('password not match')
    }
  };

  const inputClasses = `appearance-none rounded-none relative block w-full px-3 py-2 border ${
    theme === 'dark' 
      ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
      : 'border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    theme === 'dark' ? 'focus:ring-white' : 'focus:ring-black'
  } focus:z-10 sm:text-sm transition-colors`;

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? ' text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className={`max-w-md w-full space-y-8 px-5 py-5 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-gray-50'}`}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input
                id="name"
                name="username"
                type="text"
                required
                className={`${inputClasses} rounded-t-md`}
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClasses}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className={inputClasses}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} /> : <Eye className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">Confirm password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                className={`${inputClasses} rounded-b-md`}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} /> : <Eye className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md ${
                theme === 'dark' 
                  ? 'text-black bg-white hover:bg-gray-200' 
                  : 'text-white bg-black hover:bg-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme === 'dark' ? 'focus:ring-offset-gray-900 focus:ring-white' : 'focus:ring-black'
              } transition-colors`}
            >
              Sign up
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-medium ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-800'}`}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;