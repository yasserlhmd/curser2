'use client';

/**
 * Navbar Component
 * Navigation bar with authentication state
 * Shows login/register links for guests, user info and logout for authenticated users
 */
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import styles from './Navbar.module.css';

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar-container']}>
        <Link href="/" className={styles['navbar-brand']}>
          <h1>Task Manager</h1>
        </Link>

        <div className={styles['navbar-menu']}>
          {isAuthenticated ? (
            <>
              <div className={styles['navbar-user-info']}>
                <span className={styles['navbar-user-name']}>
                  {user?.name || user?.email}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className={styles['navbar-logout-btn']}
              >
                Logout
              </Button>
            </>
          ) : (
            <div className={styles['navbar-auth-links']}>
              <Link href="/login" className={styles['navbar-link']}>
                Login
              </Link>
              <Link href="/register" className={`${styles['navbar-link']} ${styles['navbar-link-primary']}`}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

