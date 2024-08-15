import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { addProduct } from "../../redux/apiCalls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from '../../services/firebase';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({
    title: '',
    desc: '',
    brand: '',
    price: '',
    inStock: true
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch product data if editing
      // Implement this when you add edit functionality
    }

    return () => {
      // Cleanup preview URLs
      previews.forEach(URL.revokeObjectURL);
    };
  }, [id, previews]);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategories = (e) => {
    setCategories(e.target.value.split(","));
  };

  const handleSize = (e) => {
    setSize(e.target.value.split(","));
  };

  const handleColor = (e) => {
    setColor(e.target.value.split(","));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Create preview URLs
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const fileName = new Date().getTime() + file.name;
        const storage = getStorage(app);
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const imageUrls = await uploadImages();
      const productData = {
        ...inputs,
        img: imageUrls,
        categories: categories,
        size: size,
        color: color,
        price: parseFloat(inputs.price)
      };

      dispatch(addProduct(productData));
      setIsUploading(false);
      navigate('/products');
    } catch (error) {
      setIsUploading(false);
      console.error('Error saving product:', error);
    }
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
              <Input id="title" name="title" value={inputs.title} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" name="desc" value={inputs.desc} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" value={inputs.brand} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="images">Images</Label>
              <Input id="images" type="file" multiple onChange={handleFileChange} />
              {previews.length > 0 && (
                <div className="mt-2">
                  <p>Image Previews:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded" />
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
              <Input id="categories" name="categories" onChange={handleCategories} />
            </div>
            <div>
              <Label htmlFor="size">Sizes (comma-separated)</Label>
              <Input id="size" name="size" onChange={handleSize} />
            </div>
            <div>
              <Label htmlFor="color">Colors (comma-separated)</Label>
              <Input id="color" name="color" onChange={handleColor} />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" value={inputs.price} onChange={handleChange} required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inStock" 
                name="inStock" 
                checked={inputs.inStock} 
                onCheckedChange={(checked) => setInputs(prev => ({ ...prev, inStock: checked }))}
              />
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