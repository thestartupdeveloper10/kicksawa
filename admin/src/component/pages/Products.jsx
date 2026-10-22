import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { deleteProduct, getProducts } from "../../redux/apiCalls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';

// At or below this many pairs a size is flagged for restocking.
const LOW_STOCK = 2;

const isTracked = (product) => Array.isArray(product.stock) && product.stock.length > 0;
const totalPairs = (product) => product.stock.reduce((sum, entry) => sum + entry.quantity, 0);
const lowSizes = (product) =>
  isTracked(product) ? product.stock.filter((entry) => entry.quantity <= LOW_STOCK) : [];

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  // These are thunks: they only run when dispatched. Calling them with
  // dispatch as an argument, as before, silently did nothing.
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
  };

  const lowCount = products.filter((product) => lowSizes(product).length > 0).length;

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!lowOnly || lowSizes(product).length > 0)
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
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant={lowOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLowOnly(!lowOnly)}
            >
              Low stock ({lowCount})
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700 dark:text-gray-300">Title</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Price</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">In Stock</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Stock</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">{product.title}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">Ksh {Number(product.price).toLocaleString('en-KE')}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {product.inStock ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Yes</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {isTracked(product) ? (
                      <>
                        <span className="font-medium">{totalPairs(product)} pairs</span>
                        {lowSizes(product).length > 0 && (
                          <span className="block text-xs text-orange-600 dark:text-orange-400">
                            Low: {lowSizes(product).map((e) => `${e.size || 'stock'} (${e.quantity})`).join(', ')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Not tracked</span>
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