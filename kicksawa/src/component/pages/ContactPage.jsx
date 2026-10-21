import { useState } from 'react';
import { Clock, Mail, MapPin, Phone, Loader2 } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Field, FormMessage, Input, Textarea } from '@/components/ui/field';
import { publicRequest } from '@/service/requestMethods';

const DETAILS = [
  { icon: Mail, label: 'Email', value: 'hello@kicksawa.co.ke', href: 'mailto:hello@kicksawa.co.ke' },
  { icon: Phone, label: 'Phone', value: '+254 700 000 000', href: 'tel:+254700000000' },
  { icon: MapPin, label: 'Store', value: 'Nairobi, Kenya' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat, 9:00–18:00' },
];

const ContactPage = () => {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    const errors = {};
    if (values.name.trim().length < 2) errors.name = 'Please tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address.';
    if (values.message.trim().length < 10) errors.message = 'Add a little more detail.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await publicRequest.post('contact', values);
      setStatus({ tone: 'success', message: 'Thanks — your message is on its way. We reply within one working day.' });
      setValues({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form failed', err);
      setStatus({ tone: 'error', message: 'We could not send that. Please try again, or email us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main" className="flex-1">
        <Section padding="md">
          <Container width="default">
            <SectionHeader
              as="h1"
              eyebrow="Get in touch"
              title="Contact Us"
              description="Questions about sizing, an order, or a drop? We are happy to help."
            />

            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {status && <FormMessage tone={status.tone}>{status.message}</FormMessage>}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" error={fieldErrors.name}>
                      {({ id, invalid, describedBy }) => (
                        <Input id={id} describedBy={describedBy} autoComplete="name" required invalid={invalid}
                          value={values.name} onChange={set('name')} placeholder="Your name" />
                      )}
                    </Field>

                    <Field label="Email" error={fieldErrors.email}>
                      {({ id, invalid, describedBy }) => (
                        <Input id={id} describedBy={describedBy} type="email" autoComplete="email" required invalid={invalid}
                          value={values.email} onChange={set('email')} placeholder="you@example.com" />
                      )}
                    </Field>
                  </div>

                  <Field label="Subject">
                    {({ id, describedBy }) => (
                      <Input id={id} describedBy={describedBy} value={values.subject} onChange={set('subject')}
                        placeholder="What is this about?" />
                    )}
                  </Field>

                  <Field label="Message" error={fieldErrors.message}>
                    {({ id, invalid, describedBy }) => (
                      <Textarea id={id} describedBy={describedBy} rows={6} required invalid={invalid}
                        value={values.message} onChange={set('message')}
                        placeholder="Tell us what you need." />
                    )}
                  </Field>

                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              </div>

              <aside className="lg:col-span-5">
                <div className="bg-surface p-8">
                  <h2 className="text-eyebrow font-bold uppercase text-muted-foreground">
                    Reach us directly
                  </h2>

                  <ul className="mt-6 space-y-6">
                    {DETAILS.map((detail) => {
                      const Icon = detail.icon;
                      return (
                        <li key={detail.label} className="flex gap-4">
                          <Icon className="h-5 w-5 shrink-0 translate-y-0.5 text-muted-foreground" strokeWidth={1.75} />
                          <div>
                            <p className="text-micro uppercase text-muted-foreground">{detail.label}</p>
                            {detail.href ? (
                              <a
                                href={detail.href}
                                className="text-[0.9375rem] font-semibold underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-foreground"
                              >
                                {detail.value}
                              </a>
                            ) : (
                              <p className="text-[0.9375rem] font-semibold">{detail.value}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </aside>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
