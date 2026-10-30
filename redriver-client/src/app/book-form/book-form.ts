import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface Book {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
}

@Component({
  selector: 'app-book-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss',
})
export class BookForm implements OnInit {
  title = '';
  author = '';
  publishedDate = '';
  errorMessage = '';

  isEditMode = false;
  bookId: number | null = null;

  private apiUrl = 'https://redriver-lia-test.onrender.com/api/books';

  private getAuthHeaders() {
    const token = sessionStorage.getItem('authToken');

    return {
      Authorization: `Bearer ${token ?? ''}`,
    };
  }
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      this.isEditMode = true;
      this.bookId = Number(id);
      this.loadBook();
    }
  }

  // Load an existing book for editing
  loadBook(): void {
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (books) => {
        const book = books.find((item) => item.id === this.bookId);

        if (book) {
          this.title = book.title;
          this.author = book.author;
          this.publishedDate = book.publishedDate;
        } else {
          this.errorMessage = 'Book not found.';
        }
      },
      error: (err) => {
        console.error('Error loading book:', err);
        this.errorMessage = 'Could not load the book.';
      },
    });
  }

  // Create or update a book
  saveBook(): void {
    this.errorMessage = '';

    const bookData = {
      title: this.title,
      author: this.author,
      publishedDate: this.publishedDate,
    };

    if (this.isEditMode && this.bookId !== null) {
      // Update existing book
      this.http
        .put(`${this.apiUrl}/${this.bookId}`, bookData, {
          headers: this.getAuthHeaders(),
        })
        .subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Error updating book:', err);
            this.errorMessage = 'Could not update the book.';
          },
        });
    } else {
      // Create new book
      this.http
        .post(this.apiUrl, bookData, {
          headers: this.getAuthHeaders(),
        })
        .subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Error saving book:', err);
            this.errorMessage = 'Could not save the book.';
          },
        });
    }
  }
}
