import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { BookForm } from './book-form/book-form';

// Protect routes that require login
const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('authToken');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const routes: Routes = [
  {
    path: 'books/new',
    component: BookForm,
    canActivate: [authGuard],
  },
  {
    path: 'books/edit/:id',
    component: BookForm,
    canActivate: [authGuard],
  },
];
