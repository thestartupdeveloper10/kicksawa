import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import app from '../../services/firebase';
import { publicRequest, userRequest, apiError } from '../../services/requestMethods';
import { ErrorNote, LoadingRows, PageHeader, Panel } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { UPLOAD_METADATA } from '@/lib/image';
import { Field, Input, Textarea } from '@/components/ui/field';
import { cn } from '@/lib/utils';

const parseList = (text) => text.split(",").map((item) => item.trim()).filter(Boolean);
// The storefront only renders hex colours as swatches.
const isHex = (value) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

const Toggle = ({ id, checked, onChange, children }) => (
  <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded border-line-strong accent-foreground"
    />
    {children}
  </label>
);

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
  const [trackStock, setTrackStock] = useState(!id);
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
        if (!cancelled) setError(apiError(err, 'Could not load this product.'));
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
    setPreviews(selectedFiles.map(file => URL.createObjectURL(file)));
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
        // Long cache metadata, so browsers can keep the photo even when it
        // is loaded straight from Firebase.
        const uploadTask = uploadBytesResumable(storageRef, file, { ...UPLOAD_METADATA, contentType: file.type });

        uploadTask.on(
          "state_changed",
          null,
          (uploadError) => reject(uploadError),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(resolve, reject);
          }
        );
      });
    });

    return Promise.all(uploadPromises);
  };

  const sizes = parseList(size);
  const colors = parseList(color);
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
        color: colors,
        price: parseFloat(inputs.price),
        // An empty list turns tracking off and hands inStock back to the switch.
        stock: trackStock ? stockList : [],
      };

      if (id) {
        await userRequest.put(`/products/${id}`, { ...productData, __v: version });
        navigate(`/products/${id}`);
      } else {
        const { data } = await userRequest.post('/products', productData);
        navigate(`/products/${data._id}`);
      }
    } catch (err) {
      setError(apiError(err, 'Could not save the product.'));
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <LoadingRows rows={8} />;

  return (
    <>
      <Link
        to={id ? `/products/${id}` : '/products'}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {id ? 'Back to product' : 'Products'}
      </Link>
      <PageHeader eyebrow="Catalogue" title={id ? 'Edit product' : 'New product'} />

      {error && <ErrorNote>{error}</ErrorNote>}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Details" bodyClassName="space-y-5">
            <Field label="Title">
              {({ id: fid }) => <Input id={fid} name="title" value={inputs.title} onChange={handleChange} required />}
            </Field>
            <Field label="Description">
              {({ id: fid }) => <Textarea id={fid} name="desc" rows={5} value={inputs.desc} onChange={handleChange} required />}
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Brand">
                {({ id: fid }) => <Input id={fid} name="brand" value={inputs.brand} onChange={handleChange} required />}
              </Field>
              <Field label="Price (Ksh)">
                {({ id: fid }) => (
                  <Input id={fid} name="price" type="number" min="0" step="1" value={inputs.price} onChange={handleChange} required />
                )}
              </Field>
            </div>
            <Field label="Categories" hint="Comma-separated, e.g. men, running">
              {({ id: fid, describedBy }) => (
                <Input id={fid} describedBy={describedBy} value={categories} onChange={(e) => setCategories(e.target.value)} />
              )}
            </Field>
            <Field label="Sizes" hint="Comma-separated EU sizes, e.g. 40, 41, 42. Leave empty for one size.">
              {({ id: fid, describedBy }) => (
                <Input id={fid} describedBy={describedBy} value={size} onChange={(e) => setSize(e.target.value)} />
              )}
            </Field>
            <Field label="Colours" hint="Comma-separated hex values, e.g. #000000, #ffffff">
              {({ id: fid, describedBy }) => (
                <div>
                  <Input id={fid} describedBy={describedBy} value={color} onChange={(e) => setColor(e.target.value)} />
                  {colors.some((c) => !isHex(c)) && (
                    <p className="mt-1.5 text-sm text-brand">
                      Colours outlined in red aren&apos;t hex values, so the store won&apos;t show them.
                    </p>
                  )}
                  {colors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {colors.map((c) => (
                        <span
                          key={c}
                          title={c}
                          className={cn(
                            'inline-block h-6 w-6 rounded-full ring-1',
                            isHex(c) ? 'ring-line-strong' : 'ring-destructive'
                          )}
                          style={isHex(c) ? { backgroundColor: c } : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Field>
          </Panel>

          <Panel title="Images">
            {existingImages.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {existingImages.map((url, index) => (
                  <div key={url} className="relative">
                    <span className="relative block h-24 w-24 overflow-hidden rounded-md bg-surface">
                      <ProductImage src={url} alt={`Image ${index + 1}`} className="img-outline h-full w-full object-cover transition-opacity duration-[400ms]" />
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove image ${index + 1}`}
                      onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              aria-label="Add images"
              className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-background"
            />
            {previews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((preview, index) => (
                  <div key={preview} className="relative">
                    <img src={preview} alt={`New image ${index + 1}`} className="h-24 w-24 rounded-md object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove new image ${index + 1}`}
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Stock" bodyClassName="space-y-4">
            <Toggle id="trackStock" checked={trackStock} onChange={setTrackStock}>Track stock per size</Toggle>
            {trackStock ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Pairs on hand. Orders take from these automatically; failed payments and cancellations
                  put them back. A size at zero shows as sold out.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {stockRows.map((s) => (
                    <Field key={s || 'one-size'} label={s ? `Size ${s}` : 'Quantity'}>
                      {({ id: fid }) => (
                        <Input
                          id={fid}
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={stock[s] ?? ''}
                          placeholder="0"
                          className="tnum"
                          onChange={(e) => setStock((prev) => ({ ...prev, [s]: e.target.value }))}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </>
            ) : (
              <Toggle id="inStock" checked={inputs.inStock} onChange={(checked) => setInputs((prev) => ({ ...prev, inStock: checked }))}>
                Show as in stock
              </Toggle>
            )}
          </Panel>

          <Button type="submit" block disabled={isUploading}>
            {isUploading ? 'Saving…' : id ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddEditProduct;
