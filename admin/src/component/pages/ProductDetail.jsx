import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProduct, deleteProduct } from "../../redux/apiCalls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = useSelector((state) => state.product.currentProduct);
  console.log(product)

  useEffect(() => {
    getProduct(id, dispatch);
  }, [id, dispatch]);

  const handleDelete = () => {
    deleteProduct(id, dispatch);
    navigate('/products');
  };

  if (!product) return <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Product Details</h2>
      
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">{product.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{product.desc}</p>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Price:</span>
                <span className="ml-2 text-green-600 dark:text-green-400">${product.price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Stock Status:</span>
                <Badge className={`ml-2 ${product.inStock ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Categories:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{product.categories.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Sizes:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{product.size.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Colors:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{product.color.join(', ')}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Images</h3>
            <div className="flex flex-wrap gap-2">
              {product.img.map((image, index) => (
                <img key={index} src={image} alt={`Product ${index + 1}`} className="w-24 h-24 object-cover rounded" />
              ))}
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <Link to={`/products/edit/${product._id}`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Edit Product</Button>
            </Link>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-100 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900"
              onClick={handleDelete}
            >
              Delete Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetail;