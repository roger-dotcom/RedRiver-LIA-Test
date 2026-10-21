
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// JWT authentication
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT key is missing.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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

builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy =>
        policy
         .WithOrigins(
    "http://localhost:4200",
    "https://red-river-lia-test.vercel.app"
)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("Angular");
app.UseAuthentication();
app.UseAuthorization();

// Users are stored in memory for this test project
var users = new List<User>();
var passwordHasher = new PasswordHasher<User>();

// Register a new user
app.MapPost("/api/register", (RegisterRequest request) =>
{
    var username = request.Username?.Trim();

    if (string.IsNullOrWhiteSpace(username) ||
        string.IsNullOrWhiteSpace(request.Password) ||
        request.Password.Length < 8)
    {
        return Results.BadRequest(new
        {
            message = "Enter a username and a password with at least 8 characters."
        });
    }

    if (users.Any(u => u.Username.Equals(
        username, StringComparison.OrdinalIgnoreCase)))
    {
        return Results.Conflict(new
        {
            message = "Username already exists."
        });
    }

    var user = new User
    {
        Username = username
    };

    user.PasswordHash = passwordHasher.HashPassword(
        user, request.Password);

    users.Add(user);

    return Results.Ok(new
    {
        message = "Registration successful."
    });
});

// Login with a registered account
app.MapPost("/api/login", (LoginRequest request) =>
{
    var user = users.FirstOrDefault(u =>
        u.Username.Equals(
            request.Username ?? "",
            StringComparison.OrdinalIgnoreCase));

    if (user is null)
    {
        return Results.Unauthorized();
    }

    var passwordResult = passwordHasher.VerifyHashedPassword(
        user, user.PasswordHash, request.Password ?? "");

    if (passwordResult == PasswordVerificationResult.Failed)
    {
        return Results.Unauthorized();
    }

    var credentials = new SigningCredentials(
        new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)),
        SecurityAlgorithms.HmacSha256
    );

    var token = new JwtSecurityToken(
        claims: new[]
        {
            new Claim(ClaimTypes.Name, user.Username)
        },
        expires: DateTime.UtcNow.AddHours(1),
        signingCredentials: credentials
    );

    var tokenString = new JwtSecurityTokenHandler()
        .WriteToken(token);

    return Results.Ok(new { token = tokenString });
});

// Sample books
var books = new List<Book>
{
    new(1, "Clean Code", "Robert C. Martin", new DateOnly(2008, 8, 1)),
    new(2, "The Pragmatic Programmer", "Andrew Hunt", new DateOnly(1999, 10, 20))
};

// Get all books
app.MapGet("/api/books", () => Results.Ok(books));

// Get a book by ID
app.MapGet("/api/books/{id:int}", (int id) =>
{
    var book = books.FirstOrDefault(b => b.Id == id);

    return book is null
        ? Results.NotFound()
        : Results.Ok(book);
});

// Add a book
app.MapPost("/api/books", (BookInput input) =>
{
    var id = books.Count == 0 ? 1 : books.Max(b => b.Id) + 1;

    var book = new Book(
        id,
        input.Title,
        input.Author,
        input.PublishedDate
    );

    books.Add(book);

    return Results.Created($"/api/books/{id}", book);
}).RequireAuthorization();

// Update a book
app.MapPut("/api/books/{id:int}", (int id, BookInput input) =>
{
    var index = books.FindIndex(b => b.Id == id);

    if (index == -1)
    {
        return Results.NotFound();
    }

    books[index] = new Book(
        id,
        input.Title,
        input.Author,
        input.PublishedDate
    );

    return Results.Ok(books[index]);
}).RequireAuthorization();

// Delete a book
app.MapDelete("/api/books/{id:int}", (int id) =>
{
    var book = books.FirstOrDefault(b => b.Id == id);

    if (book is null)
    {
        return Results.NotFound();
    }

    books.Remove(book);

    return Results.NoContent();
}).RequireAuthorization();

// Favorite quotes
var quotes = new List<Quote>
{
    new(1, "The only way to do great work is to love what you do.", "Steve Jobs"),
    new(2, "It always seems impossible until it's done.", "Nelson Mandela"),
    new(3, "Stay hungry, stay foolish.", "Steve Jobs"),
    new(4, "Knowledge is power.", "Francis Bacon"),
    new(5, "The journey of a thousand miles begins with a single step.", "Lao Tzu")
};

// Get all quotes
app.MapGet("/api/quotes", () => Results.Ok(quotes));

// Get a quote by ID
app.MapGet("/api/quotes/{id:int}", (int id) =>
{
    var quote = quotes.FirstOrDefault(q => q.Id == id);

    return quote is null
        ? Results.NotFound()
        : Results.Ok(quote);
});

// Add a quote
app.MapPost("/api/quotes", (QuoteInput input) =>
{
    var id = quotes.Count == 0 ? 1 : quotes.Max(q => q.Id) + 1;

    var quote = new Quote(id, input.Text, input.Author);
    quotes.Add(quote);

    return Results.Created($"/api/quotes/{id}", quote);
}).RequireAuthorization();

// Update a quote
app.MapPut("/api/quotes/{id:int}", (int id, QuoteInput input) =>
{
    var index = quotes.FindIndex(q => q.Id == id);

    if (index == -1)
    {
        return Results.NotFound();
    }

    quotes[index] = new Quote(id, input.Text, input.Author);

    return Results.Ok(quotes[index]);
}).RequireAuthorization();

// Delete a quote
app.MapDelete("/api/quotes/{id:int}", (int id) =>
{
    var quote = quotes.FirstOrDefault(q => q.Id == id);

    if (quote is null)
    {
        return Results.NotFound();
    }

    quotes.Remove(quote);

    return Results.NoContent();
}).RequireAuthorization();

app.Run();

record Book(int Id, string Title, string Author, DateOnly PublishedDate);

record BookInput(string Title, string Author, DateOnly PublishedDate);

record Quote(int Id, string Text, string Author);

record QuoteInput(string Text, string Author);

record RegisterRequest(string Username, string Password);

record LoginRequest(string Username, string Password);

class User
{
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";
}
