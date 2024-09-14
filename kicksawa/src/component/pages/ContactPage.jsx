import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ContactPage = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post('http://localhost:3000/api/contact', formData);
      console.log('Form submitted successfully:', response.data);
      setSubmitStatus({ type: 'success', message: 'Your message has been sent successfully!' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? ' text-white' : 'bg-white text-black'} min-h-screen transition-colors duration-300`}>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>
        
        {submitStatus && (
          <Alert className={`mb-6 ${submitStatus.type === 'success' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
            <AlertTitle>{submitStatus.type === 'success' ? 'Success!' : 'Error'}</AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-12">
          {/* Contact Form */}
          <div className="md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded ${theme === 'dark' ? 'bg-[#130d14] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded ${theme === 'dark' ? 'bg-[#130d14] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2 font-semibold">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded ${theme === 'dark' ? 'bg-[#130d14] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2 font-semibold">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className={`w-full px-4 py-2 border rounded ${theme === 'dark' ? 'bg-[#130d14] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className={`${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} py-3 px-6 rounded transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="md:w-1/3 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-4" />
                  <span>info@urbancult.com</span>
                </li>
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-4" />
                  <span>+1 (123) 456-7890</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="w-5 h-5 mr-4" />
                  <span>123 Urban Street, City, Country</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Business Hours</h2>
              <p>Monday - Friday: 9am - 6pm</p>
              <p>Saturday: 10am - 4pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;