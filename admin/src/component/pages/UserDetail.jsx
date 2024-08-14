import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data (replace with actual API call)
    setUser({
      id: id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Customer',
      joinDate: '2023-01-15',
      lastLogin: '2023-08-01',
      orderCount: 5,
      totalSpent: 499.95,
    });
  }, [id]);

  if (!user) return <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">User Details</h2>
      
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Email:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Role:</span>
                <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  {user.role}
                </Badge>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Join Date:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{user.joinDate}</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Last Login:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{user.lastLogin}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Total Orders:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{user.orderCount}</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Total Spent:</span>
                <span className="ml-2 text-green-600 dark:text-green-400">${user.totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Edit User</Button>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-100 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900">Delete User</Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional section for user's recent orders */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-700 dark:text-gray-300">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock data for recent orders */}
              {[
                { id: '1001', date: '2023-07-15', total: 99.99, status: 'Delivered' },
                { id: '1002', date: '2023-07-28', total: 149.99, status: 'Shipped' },
                { id: '1003', date: '2023-08-05', total: 79.99, status: 'Processing' },
              ].map((order) => (
                <tr key={order.id} className="text-gray-600 dark:text-gray-400">
                  <td className="py-2">{order.id}</td>
                  <td className="py-2">{order.date}</td>
                  <td className="py-2">${order.total.toFixed(2)}</td>
                  <td className="py-2">
                    <Badge className={`
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : ''}
                      ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : ''}
                      ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : ''}
                    `}>
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetail;