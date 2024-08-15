import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { deleteProduct, getProducts } from "../../redux/apiCalls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getProducts(dispatch);
  }, [dispatch]);

  const handleDelete = (id) => {
    deleteProduct(id, dispatch);
  };

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
                <TableRow key={product._id}>
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
                    <Link to={`/products/${product._id}`} className="mr-2">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link to={`/products/edit/${product._id}`} className="mr-2">
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </Button>
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