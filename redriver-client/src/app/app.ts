import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Book {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  books = signal<Book[]>([]);
  // Login state
  username = '';
  password = '';
  loginError = '';
  token = signal<string | null>(sessionStorage.getItem('authToken'));

  private loginUrl = 'http://localhost:5031/api/login';

  private apiUrl = 'http://localhost:5031/api/books';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBooks();
  }
  // Login with username and password
  login(): void {
    this.loginError = '';

    this.http
      .post<{ token: string }>(this.loginUrl, {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.token.set(response.token);
          sessionStorage.setItem('authToken', response.token);
          this.password = '';
          console.log('Login successful');
        },
        error: () => {
          this.loginError = 'Invalid username or password';
          this.token.set(null);
        },
      });
  }
  // Log out and clear the saved JWT token
  logout(): void {
    sessionStorage.removeItem('authToken');
    this.token.set(null);
    this.username = '';
    this.password = '';
    this.loginError = '';
  }
  // Get all books
  loadBooks(): void {
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.books.set(data);
      },
      error: (err) => {
        console.error('Error loading books:', err);
      },
    });
  }

  // Delete a book
  deleteBook(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this book?');

    if (!confirmed) {
      return;
    }

    this.http
      .delete<void>(`${this.apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token()}`,
        },
      })
      .subscribe({
        next: () => {
          this.books.update((books) => books.filter((book) => book.id !== id));
        },
        error: (err) => {
          console.error('Error deleting book:', err);
          window.alert('Could not delete the book.');
        },
      });
  }
}
