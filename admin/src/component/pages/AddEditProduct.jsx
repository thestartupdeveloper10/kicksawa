import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// import { storage } from '../firebase'; // Ensure this import points to your Firebase config
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    title: '',
    desc: '',
    img: [],
    categories: [],
    size: [],
    color: [],
    price: '',
    inStock: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      setProduct(data);
      setImagePreviews(data.img);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim());
    setProduct(prevProduct => ({
      ...prevProduct,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const uploadImages = async () => {
    setIsUploading(true);
    const uploadedUrls = [];

    // for (const file of imageFiles) {
    //   const storageRef = ref(storage, `products/${file.name}`);
    //   await uploadBytes(storageRef, file);
    //   const url = await getDownloadURL(storageRef);
    //   uploadedUrls.push(url);
    // }

    setIsUploading(false);
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = product.img;
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }

      const productData = {
        ...product,
        img: imageUrls,
        price: parseFloat(product.price)
      };

      // Replace with your actual API call
      const response = await fetch(id ? `/api/products/${id}` : '/api/products', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        navigate('/products');
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">{id ? 'Edit Product' : 'Add New Product'}</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Product Details' : 'New Product Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={product.title} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" value={product.desc} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="images">Images</Label>
              <Input id="images" type="file" multiple onChange={handleImageChange} />
              {imagePreviews.length > 0 && (
                <div className="mt-2">
                  <p>Image Previews:</p>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-20 h-20 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="categories">Categories (comma-separated)</Label>
              <Input id="categories" name="categories" value={product.categories.join(', ')} onChange={(e) => handleArrayChange(e, 'categories')} />
            </div>
            <div>
              <Label htmlFor="size">Sizes (comma-separated)</Label>
              <Input id="size" name="size" value={product.size.join(', ')} onChange={(e) => handleArrayChange(e, 'size')} />
            </div>
            <div>
              <Label htmlFor="color">Colors (comma-separated)</Label>
              <Input id="color" name="color" value={product.color.join(', ')} onChange={(e) => handleArrayChange(e, 'color')} />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" value={product.price} onChange={handleChange} required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inStock" name="inStock" checked={product.inStock} onCheckedChange={(checked) => setProduct(prev => ({ ...prev, inStock: checked }))} />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : (id ? 'Update Product' : 'Add Product')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditProduct;