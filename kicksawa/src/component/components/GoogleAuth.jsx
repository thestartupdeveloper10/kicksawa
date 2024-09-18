import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import app from '../../service/firebase';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/userRedux';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';

function GoogleAuth() {
    const auth = getAuth(app)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })
        try {
            const resultsFromGoogle = await signInWithPopup(auth, provider
            )
            console.log('results from goole',resultsFromGoogle)
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
    <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className={`w-full flex justify-center py-2 px-4 border ${theme === 'dark' ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
            >
              <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
              Continue with Google
            </button>
    </div>
  )
}

export default GoogleAuth