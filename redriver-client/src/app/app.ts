import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Book {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
}

interface Quote {
  id: number;
  text: string;
  author: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  menuOpen = false;
  books = signal<Book[]>([]);
  quotes = signal<Quote[]>([]);

  username = '';
  password = '';
  loginError = '';
  token = signal<string | null>(sessionStorage.getItem('authToken'));

  showRegister = false;
  registerUsername = '';
  registerPassword = '';
  registerMessage = '';
  registerError = '';

  private apiUrl = 'https://redriver-lia-test.onrender.com/api';

  constructor(
    private http: HttpClient,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadQuotes();
  }

  // Login
  login(): void {
    this.loginError = '';

    this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.token.set(response.token);
          sessionStorage.setItem('authToken', response.token);
          this.password = '';
        },
        error: () => {
          this.loginError = 'Invalid username or password';
          this.token.set(null);
          sessionStorage.removeItem('authToken');
        },
      });
  }

  // Register a new user
  register(): void {
    this.registerError = '';
    this.registerMessage = '';

    if (!this.registerUsername.trim() || !this.registerPassword) {
      this.registerError = 'Please enter a username and password.';
      return;
    }

    this.http
      .post(`${this.apiUrl}/register`, {
        username: this.registerUsername.trim(),
        password: this.registerPassword,
      })
      .subscribe({
        next: () => {
          this.registerMessage = 'Account created! You can now log in.';
          this.username = this.registerUsername.trim();
          this.registerUsername = '';
          this.registerPassword = '';
          this.showRegister = false;
        },
        error: (error) => {
          if (error.status === 409) {
            this.registerError = 'This username is already taken.';
          } else if (error.error?.message) {
            this.registerError = error.error.message;
          } else {
            this.registerError = 'Password must be stronger (at least 8 characters, etc.)';
          }
        },
      });
  }

  // Logout
  logout(): void {
    sessionStorage.removeItem('authToken');
    this.token.set(null);
    this.username = '';
    this.password = '';
    this.loginError = '';
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token()}`,
    });
  }

  // Load books
  loadBooks(): void {
    this.http.get<Book[]>(`${this.apiUrl}/books`).subscribe({
      next: (books) => this.books.set(books),
      error: (error) => console.error('Could not load books:', error),
    });
  }

  // Delete a book
  deleteBook(id: number): void {
    if (!this.token()) return;

    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    this.http
      .delete<void>(`${this.apiUrl}/books/${id}`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.books.update((books) => books.filter((book) => book.id !== id));
        },
        error: () => window.alert('Could not delete the book.'),
      });
  }

  // Load favorite quotes
  loadQuotes(): void {
    this.http.get<Quote[]>(`${this.apiUrl}/quotes`).subscribe({
      next: (quotes) => this.quotes.set(quotes),
      error: (error) => console.error('Could not load quotes:', error),
    });
  }

  // Add a quote
  addQuote(text: string, author: string): void {
    if (!this.token() || !text.trim() || !author.trim()) return;

    this.http
      .post<Quote>(
        `${this.apiUrl}/quotes`,
        {
          text: text.trim(),
          author: author.trim(),
        },
        {
          headers: this.authHeaders(),
        },
      )
      .subscribe({
        next: () => this.loadQuotes(),
        error: () => window.alert('Could not add the quote.'),
      });
  }

  // Update a quote
  updateQuote(quote: Quote): void {
    if (!this.token()) return;

    const text = window.prompt('Edit quote:', quote.text);
    if (text === null || !text.trim()) return;

    const author = window.prompt('Edit author:', quote.author);
    if (author === null || !author.trim()) return;

    this.http
      .put<Quote>(
        `${this.apiUrl}/quotes/${quote.id}`,
        {
          text: text.trim(),
          author: author.trim(),
        },
        {
          headers: this.authHeaders(),
        },
      )
      .subscribe({
        next: () => this.loadQuotes(),
        error: () => window.alert('Could not update the quote.'),
      });
  }

  // Delete a quote
  deleteQuote(id: number): void {
    if (!this.token()) return;

    if (!window.confirm('Are you sure you want to delete this quote?')) {
      return;
    }

    this.http
      .delete<void>(`${this.apiUrl}/quotes/${id}`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => this.loadQuotes(),
        error: () => window.alert('Could not delete the quote.'),
      });
  }
}
