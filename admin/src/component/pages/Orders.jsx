import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Orders = () => {
  const [orders, setOrders] = useState([
    { id: 1001, customer: 'John Doe', total: 699.99, status: 'Pending' },
    { id: 1002, customer: 'Jane Smith', total: 1299.99, status: 'Shipped' },
    { id: 1003, customer: 'Bob Johnson', total: 149.99, status: 'Delivered' },
    { id: 1004, customer: 'Alice Brown', total: 249.99, status: 'Pending' },
    { id: 1005, customer: 'Charlie Wilson', total: 499.99, status: 'Shipped' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Shipped': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Delivered': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Orders Management</h2>
      
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700 dark:text-gray-300">Order ID</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Total</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">{order.id}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{order.customer}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;