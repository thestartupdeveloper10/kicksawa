import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/userRedux';
import { publicRequest } from '../../service/requestMethods';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import app from '@/service/firebase';
import axios from 'axios';

const LoginPage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const auth = getAuth(app)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const response = await publicRequest.post('/auth/login', { email, password });
      dispatch(loginSuccess(response.data));
      navigate('/'); // Redirect to home page or dashboard
    } catch (err) {
      dispatch(loginFailure());
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
        const resultsFromGoogle = await signInWithPopup(auth, provider)
        const res = await axios.post('http://localhost:3000/api/auth/google', {
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
      });
      if (res.status === 200) {
        dispatch(loginSuccess(res.data));
        navigate('/');
    }
        
    } catch (error) {
      console.log(error);
    }
    
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? '' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className={`max-w-md w-full space-y-8 px-5 py-5 ${theme === 'dark' ? 'bg-[#130d14]' : 'bg-gray-50'}`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'} rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm`}
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
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'} rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm`}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-600 border-gray-600 bg-gray-800' : 'text-black border-gray-300'} focus:ring-black rounded`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className={`font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-800'}`}>
                Forgot your password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-center mt-2">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md ${theme === 'dark' ? 'text-black bg-white hover:bg-gray-200' : 'text-white bg-black hover:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${theme === 'dark' ? 'bg-[#130d14] text-gray-400' : 'bg-gray-50 text-gray-500'}`}>Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className={`w-full flex justify-center py-2 px-4 border ${theme === 'dark' ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
            >
              <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link to="/signup" className={`font-medium ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-800'}`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;