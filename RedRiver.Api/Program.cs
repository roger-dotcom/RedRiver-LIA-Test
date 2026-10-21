using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
var builder = WebApplication.CreateBuilder(args);

// Configure JWT authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is missing.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Allow Angular to communicate with the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("Angular");
app.UseAuthentication();
app.UseAuthorization();
// Test login - development only
app.MapPost("/api/login", (LoginRequest request) =>
{
    if (request.Username != "admin" ||
        request.Password != "Test123!")
    {
        return Results.Unauthorized();
    }

    var credentials = new SigningCredentials(
        new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)),
        SecurityAlgorithms.HmacSha256
    );

    var token = new JwtSecurityToken(
        expires: DateTime.UtcNow.AddHours(1),
        signingCredentials: credentials
    );

    var tokenString = new JwtSecurityTokenHandler()
        .WriteToken(token);

    return Results.Ok(new { token = tokenString });
});
// Temporary book storage
var books = new List<Book>
{
    new(1, "Clean Code", "Robert C. Martin", new DateOnly(2008, 8, 1)),
    new(2, "The Pragmatic Programmer", "Andrew Hunt", new DateOnly(1999, 10, 20))
};

// Get all books
app.MapGet("/api/books", () => Results.Ok(books));

// Add a book
app.MapPost("/api/books", (BookInput input) =>
{
    var id = books.Count == 0 ? 1 : books.Max(b => b.Id) + 1;
    var book = new Book(id, input.Title, input.Author, input.PublishedDate);
    books.Add(book);
    return Results.Created($"/api/books/{id}", book);
});

// Update a book
app.MapPut("/api/books/{id:int}", (int id, BookInput input) =>
{
    var index = books.FindIndex(b => b.Id == id);
    if (index == -1) return Results.NotFound();

    books[index] = new Book(id, input.Title, input.Author, input.PublishedDate);
    return Results.Ok(books[index]);
});

// Delete a book
app.MapDelete("/api/books/{id:int}", (int id) =>
{
    var book = books.FirstOrDefault(b => b.Id == id);
    if (book is null) return Results.NotFound();

    books.Remove(book);
    return Results.NoContent();
});

app.Run();

record Book(int Id, string Title, string Author, DateOnly PublishedDate);
record BookInput(string Title, string Author, DateOnly PublishedDate);
record LoginRequest(string Username, string Password);
