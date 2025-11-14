'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import styles from './auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, setError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (error) {
      setError(null);
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-container']}>
        <div className={styles['auth-header']}>
          <h1>Task Manager</h1>
          <h2>Login</h2>
          <p>Welcome back! Please login to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles['auth-form']}>
          {error && <div className={styles['auth-error']}>{error}</div>}

          <Input
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" disabled={loading} className={styles['auth-submit']}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className={styles['auth-footer']}>
          <p>
            Don't have an account? <Link href="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

