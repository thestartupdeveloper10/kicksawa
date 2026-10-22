import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from '../../services/firebase';
import { publicRequest, userRequest } from '../../services/requestMethods';

const parseList = (text) => text.split(",").map((item) => item.trim()).filter(Boolean);

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    title: '',
    desc: '',
    brand: '',
    price: '',
    inStock: true
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  // Stock is per size; a product without sizes keeps its count under ''.
  const [trackStock, setTrackStock] = useState(false);
  const [stock, setStock] = useState({});
  // The version the editor loaded, so the server can refuse a save that would
  // overwrite stock sold while this form was open.
  const [version, setVersion] = useState(undefined);
  const [loading, setLoading] = useState(Boolean(id));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await publicRequest.get(`/products/find/${id}`);
        if (cancelled || !data) return;
        setInputs({
          title: data.title || '',
          desc: data.desc || '',
          brand: data.brand || '',
          price: data.price ?? '',
          inStock: data.inStock !== false,
        });
        setExistingImages(data.img || []);
        setCategories((data.categories || []).join(', '));
        setSize((data.size || []).join(', '));
        setColor((data.color || []).join(', '));
        const tracked = Array.isArray(data.stock) && data.stock.length > 0;
        setTrackStock(tracked);
        setStock(tracked ? Object.fromEntries(data.stock.map((e) => [e.size, String(e.quantity)])) : {});
        setVersion(data.__v);
      } catch (err) {
        console.error('Failed to load product', err);
        if (!cancelled) setError('Could not load this product.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const sizes = parseList(size);
  // One row per size, or a single row for a product sold without sizes.
  const stockRows = sizes.length > 0 ? sizes : [''];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const stockList = stockRows.map((s) => ({ size: s, quantity: Number(stock[s] ?? 0) }));
    if (trackStock && stockList.some((row) => !Number.isInteger(row.quantity) || row.quantity < 0)) {
      setError('Stock quantities must be whole numbers, 0 or more.');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrls = await uploadImages();
      const productData = {
        ...inputs,
        img: [...existingImages, ...imageUrls],
        categories: parseList(categories),
        size: sizes,
        color: parseList(color),
        price: parseFloat(inputs.price),
        // An empty list turns tracking off and hands inStock back to the switch.
        stock: trackStock ? stockList : [],
      };

      if (id) {
        await userRequest.put(`/products/${id}`, { ...productData, __v: version });
      } else {
        await userRequest.post('/products', productData);
      }
      navigate('/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.error || 'Could not save the product.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>;

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
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-2 my-2">
                  {existingImages.map((url, index) => (
                    <div key={url} className="relative">
                      <img src={url} alt={`Image ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              <Input id="categories" name="categories" value={categories} onChange={(e) => setCategories(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="size">Sizes (comma-separated)</Label>
              <Input id="size" name="size" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="color">Colors (comma-separated)</Label>
              <Input id="color" name="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="price">Price (Ksh)</Label>
              <Input id="price" name="price" type="number" step="0.01" value={inputs.price} onChange={handleChange} required />
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trackStock"
                  checked={trackStock}
                  onCheckedChange={(checked) => setTrackStock(Boolean(checked))}
                />
                <Label htmlFor="trackStock">Track stock</Label>
              </div>
              {trackStock ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pairs on hand. Sales take from these automatically, failed payments and
                    cancellations put them back, and the product shows as sold out at zero.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {stockRows.map((s) => (
                      <div key={s || 'one-size'}>
                        <Label htmlFor={`stock-${s || 'one-size'}`}>{s ? `Size ${s}` : 'Quantity'}</Label>
                        <Input
                          id={`stock-${s || 'one-size'}`}
                          type="number"
                          min="0"
                          step="1"
                          value={stock[s] ?? ''}
                          placeholder="0"
                          onChange={(e) => setStock((prev) => ({ ...prev, [s]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    name="inStock"
                    checked={inputs.inStock}
                    onCheckedChange={(checked) => setInputs(prev => ({ ...prev, inStock: checked }))}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Saving...' : (id ? 'Update Product' : 'Add Product')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditProduct;
