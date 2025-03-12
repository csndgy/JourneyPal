
using JourneyPalBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;
using Google.Apis.Auth.AspNetCore3;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;

namespace JourneyPalBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<JourneyPalDbContext>(options => options.UseSqlite(connectionString: "Data Source = JourneyPal.db"));
            // Add services to the container.
            var jwtSettings = builder.Configuration.GetSection("Jwt");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = false,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                };

                // Add these lines to prevent redirect
                options.Events = new JwtBearerEvents
                {
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();

                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
                    }
                };
            });
            builder.Services.AddSwaggerGen(config =>
            {
                config.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "JWT token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "bearer"
                });
                config.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type=ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });


            builder.Services.AddAuthentication(options =>
            {
                options.DefaultChallengeScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
                options.DefaultForbidScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            }).AddCookie()
            .AddGoogleOpenIdConnect(options =>
            {
                options.ClientId = "13684633292-hv8dlbubct2ujgmpl65btbb45551k6i4.apps.googleusercontent.com";
                options.ClientSecret = "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";
            });

            builder.Services.AddCors(o =>
            {
                o.AddPolicy("AllowAll", builder =>
                {
                    builder.WithOrigins("http://localhost:5173")
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                    //.WithExposedHeaders("WWW-Authenticate");
                });
            });

            builder.Services.Configure<IdentityOptions>(o =>
            {
                o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                o.Lockout.MaxFailedAccessAttempts = 5;
                o.Lockout.AllowedForNewUsers = false;
                o.Password.RequireDigit = true;
                o.Password.RequiredLength = 8;
                o.Password.RequireLowercase = true;
                o.Password.RequireNonAlphanumeric = true;
                o.Password.RequireUppercase = true;
                o.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._";
                o.User.RequireUniqueEmail = true;
            });

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<JourneyPalDbContext>()
                .AddDefaultTokenProviders();
            builder.Services.AddAuthorization();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.UseAuthentication();
            app.MapControllers();
            app.Run();
        }
    }
}
