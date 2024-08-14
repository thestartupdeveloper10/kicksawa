import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    joinDate: '2023-01-15',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Profile</h2>
      
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
              <Input
                id="role"
                name="role"
                value={profile.role}
                disabled
                className="bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="joinDate" className="text-gray-700 dark:text-gray-300">Join Date</Label>
              <Input
                id="joinDate"
                name="joinDate"
                value={profile.joinDate}
                disabled
                className="bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            {isEditing ? (
              <div className="flex space-x-4">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="text-gray-700 dark:text-gray-300">Cancel</Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700 text-white">Edit Profile</Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;