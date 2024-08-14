import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([
    { id: 1, title: 'Smartphone X', price: 699.99, inStock: true },
    { id: 2, title: 'Laptop Pro', price: 1299.99, inStock: true },
    { id: 3, title: 'Wireless Earbuds', price: 149.99, inStock: false },
    { id: 4, title: 'Smart Watch', price: 249.99, inStock: true },
    { id: 5, title: 'Gaming Console', price: 499.99, inStock: true },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Products Management</h2>
        <Link to="/products/add">
          <Button>Add New Product</Button>
        </Link>
      </div>
      
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700 dark:text-gray-300">Title</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Price</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">In Stock</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">{product.title}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {product.inStock ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Yes</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link to={`/products/${product.id}`} className="mr-2">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link to={`/products/edit/${product.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
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

export default Products;