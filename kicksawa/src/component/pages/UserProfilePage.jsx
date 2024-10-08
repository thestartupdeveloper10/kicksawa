import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Camera } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';
import { userRequest } from '../../service/requestMethods';
import { updateUser } from '../../redux/userRedux';

const UserProfilePage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [user, setUser] = useState(currentUser);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await userRequest.get(`orders/find/${currentUser.id}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again.');
      }
    };

    fetchOrders();
  }, [currentUser._id]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await userRequest.put(`/users/${currentUser.id}`, user);
      dispatch(updateUser(response.data));
      setEditing(false);
      setUser(response.data);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user details. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({ ...prevUser, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await userRequest.post('/upload', formData);
        setUser(prevUser => ({ ...prevUser, profilePic: response.data.imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const inputClasses = `border-b ${theme === 'dark' ? 'border-gray-500 bg-[#130d14] text-white' : 'border-gray-300 text-black'} focus:border-black outline-none transition-colors`;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'processing':
        return 'bg-blue-200 text-blue-800';
      case 'shipped':
        return 'bg-green-200 text-green-800';
      case 'delivered':
        return 'bg-purple-200 text-purple-800';
      case 'cancelled':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'text-white' : 'bg-gray-50 text-black'} min-h-screen transition-colors duration-300`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        
        <div className={`${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} shadow rounded-lg p-6 mb-8`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Personal Information</h2>
            {!editing && (
              <button onClick={handleEdit} className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}`}>
                <Edit2 size={20} />
              </button>
            )}
          </div>

          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {user.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
              ) : (
                <div className={`w-32 h-32 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <User size={48} />
                </div>
              )}
              {editing && (
                <button 
                  onClick={triggerFileInput} 
                  className={`absolute bottom-0 right-0 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} rounded-full p-2 transition-colors`}
                >
                  <Camera size={16} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* User information fields */}
            {['name', 'email', 'phone', 'location'].map((field) => (
              <div key={field} className="flex items-center">
                {field === 'name' && <User className="mr-2 capitalize" size={20} />}
                {field === 'email' && <Mail className="mr-2" size={20} />}
                {field === 'phone' && <Phone className="mr-2" size={20} />}
                {field === 'location' && <MapPin className="mr-2" size={20} />}
                {editing ? (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={user[field] || ''}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                ) : (
                  <span>{user[field] || 'Not provided'}</span>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <button onClick={handleSave} className={`mt-6 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-4 py-2 rounded transition-colors`}>
              Save Changes
            </button>
          )}
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#130d14]' : 'bg-white'} shadow rounded-lg p-6`}>
          <h2 className="text-2xl font-semibold mb-4">Order History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={theme === 'dark' ? 'bg-[#23272a]' : 'bg-gray-100'}>
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className={theme === 'dark' ? 'border-b border-gray-700' : 'border-b'}>
                    <td className="px-4 py-2">{order._id}</td>
                    <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">Ksh {order.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;