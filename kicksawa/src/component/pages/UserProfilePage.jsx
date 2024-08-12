import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Eye, EyeOff, Camera } from 'lucide-react';

const UserProfilePage = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, Anytown, AN 12345',
    password: '********',
    profileImage: null
  });

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [orders, setOrders] = useState([
    { id: '1001', date: '2023-07-15', total: 120.50, status: 'Delivered' },
    { id: '1002', date: '2023-08-02', total: 85.75, status: 'Shipped' },
    { id: '1003', date: '2023-08-10', total: 200.00, status: 'Processing' },
  ]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
    // Here you would typically send the updated user data to your backend
    console.log('Saving user data:', user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({ ...prevUser, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prevUser => ({ ...prevUser, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
          {!editing && (
            <button onClick={handleEdit} className="text-black hover:text-gray-700">
              <Edit2 size={20} />
            </button>
          )}
        </div>

        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={48} />
              </div>
            )}
            {editing && (
              <button 
                onClick={triggerFileInput} 
                className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 hover:bg-gray-800"
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
          <div className="flex items-center">
            <User className="mr-2" size={20} />
            {editing ? (
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="border-b border-gray-300 focus:border-black outline-none"
              />
            ) : (
              <span>{user.name}</span>
            )}
          </div>
          <div className="flex items-center">
            <Mail className="mr-2" size={20} />
            {editing ? (
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="border-b border-gray-300 focus:border-black outline-none"
              />
            ) : (
              <span>{user.email}</span>
            )}
          </div>
          <div className="flex items-center">
            <Phone className="mr-2" size={20} />
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                className="border-b border-gray-300 focus:border-black outline-none"
              />
            ) : (
              <span>{user.phone}</span>
            )}
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2" size={20} />
            {editing ? (
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleChange}
                className="border-b border-gray-300 focus:border-black outline-none w-full"
              />
            ) : (
              <span>{user.address}</span>
            )}
          </div>
          <div className="flex items-center">
            <Eye className="mr-2" size={20} />
            {editing ? (
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  className="border-b border-gray-300 focus:border-black outline-none w-full"
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            ) : (
              <span>{user.password}</span>
            )}
          </div>
        </div>
        {editing && (
          <button onClick={handleSave} className="mt-6 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Save Changes
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Order History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2">{order.id}</td>
                  <td className="px-4 py-2">{order.date}</td>
                  <td className="px-4 py-2">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-2">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;