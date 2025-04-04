﻿using Google.Apis.Auth;
using IdentityModel.Client;
using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MimeKit;
using Microsoft.AspNetCore.Authorization;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class AuthController : ControllerBase
    {
        #region Variables and Constructor
        private readonly JourneyPalDbContext _ctx;
        private readonly IConfiguration _conf;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public AuthController(JourneyPalDbContext context, IConfiguration configuration, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _ctx = context;
            _conf = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
        }
        #endregion
        #region API Calls
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserDTO user)
        {
            if (user == null || string.IsNullOrEmpty(user.UserName)
                || string.IsNullOrEmpty(user.Email)
                || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Invalid user data.");
            }

            if (await _ctx.Users.AnyAsync(u => u.UserName == user.UserName))
            {
                return BadRequest("Username is already taken!");
            }

            if (await _ctx.Users.AnyAsync(u => u.Email == user.Email))
            {
                return BadRequest("An account is already registered with this Email address!");
            }

            var newUser = new User
            {
                UserName = user.UserName,
                Email = user.Email,
                EmailConfirmed = true,
                Role = "User"
            };

            var result = await _userManager.CreateAsync(newUser, user.Password);
            try
            {
                await _userManager.AddToRoleAsync(newUser, "User");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}\nInner exception: {ex.InnerException}");
            }

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            await _ctx.SaveChangesAsync();

            return Ok(new { Message = "Successful registration!" });
        }

        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin")]
        [HttpPost("admin-register")]
        public async Task<IActionResult> AdminRegister([FromBody] UserDTO user)
        {
            if (user == null || string.IsNullOrEmpty(user.UserName)
                || string.IsNullOrEmpty(user.Email)
                || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Invalid user data.");
            }

            if (await _ctx.Users.AnyAsync(u => u.UserName == user.UserName))
            {
                return BadRequest("Username is already taken!");
            }

            if (await _ctx.Users.AnyAsync(u => u.Email == user.Email))
            {
                return BadRequest("An account is already registered with this Email addreccd cdcdss!");
            }

            var newUser = new User
            {
                UserName = user.UserName,
                Email = user.Email,
                EmailConfirmed = true,
                Role = "Admin"
            };
            
            var result = await _userManager.CreateAsync(newUser, user.Password);
            await _userManager.RemoveFromRoleAsync(newUser, "User");
            await _userManager.AddToRoleAsync(newUser, "Admin");

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            await _ctx.SaveChangesAsync();

            return Ok(new { Message = "Successful registration!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO user)
        {
            try
            {
                if (string.IsNullOrEmpty(user.Email) && string.IsNullOrEmpty(user.UserName))
                {
                    return BadRequest("Email or Username must be provided.");
                }

                User? existingUser = null;


                if (!string.IsNullOrEmpty(user.Email))
                {
                    existingUser = await _userManager.FindByEmailAsync(user.Email);
                }

                if (existingUser == null && !string.IsNullOrEmpty(user.UserName))
                {
                    existingUser = await _userManager.FindByNameAsync(user.UserName);
                }

                if (existingUser == null)
                {
                    return BadRequest("User not found.");
                }

                // Debug point 4: Log password check
                var result = await _signInManager.CheckPasswordSignInAsync(existingUser, user.Password, false);

                if (!result.Succeeded)
                {
                    if (result.IsLockedOut)
                        return BadRequest("Account is locked out.");
                    if (result.IsNotAllowed)
                        return BadRequest("Login not allowed.");
                    if (result.RequiresTwoFactor)
                        return BadRequest("Requires two-factor authentication.");

                    return Unauthorized("Invalid credentials.");
                }

                var token = GenerateToken(existingUser);
                var refreshToken = GenerateRefreshToken();
                string identifier = existingUser.Id;

                existingUser.RefreshToken = refreshToken;
                existingUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _ctx.SaveChangesAsync();

                return Ok(new { Token = token, RefreshToken = refreshToken, Identifier = identifier });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
        [Authorize(AuthenticationSchemes ="Bearer")]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDTO request)
        {
            if (request == null || string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest("Invalid request.");
            }

            // Find user by refresh token (instead of validating as JWT)
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return BadRequest("Invalid refresh token.");
            }

            var newToken = GenerateToken(user);
            var newRefreshToken = GenerateRefreshToken(); // Keep as random string if you prefer

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _ctx.SaveChangesAsync();

            return Ok(new { Token = newToken, RefreshToken = newRefreshToken });
        }
        [Authorize(AuthenticationSchemes ="Bearer")]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var username = User.Identity.Name;
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null)
                return BadRequest("User not found.");

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = DateTime.MinValue;

            await _ctx.SaveChangesAsync();

            return Ok(new { Message = "Logged out successfully." });
        }
        
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Ok("If the email is registered, you will receive a password reset link.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var resetLink = $"http://localhost:5173/reset-password?token={WebUtility.UrlEncode(token)}&email={WebUtility.UrlEncode(request.Email)}";

            await SendPasswordResetEmailAsync(request.Email, resetLink);

            return Ok("Password reset link has been sent to your email.");
        }
        
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return BadRequest("Invalid request.");

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

            if (result.Succeeded)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = DateTime.MinValue;
                return Ok("Password reset successful.");
            }

            return BadRequest("Password reset failed.");
        }
        #endregion
        #region Helper functions    
        private async Task SendPasswordResetEmailAsync(string email, string resetLink)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("JourneyPal", "noreply@journeypal.com"));
            emailMessage.To.Add(new MailboxAddress("", email));
            emailMessage.Subject = "Password Reset Request";
            emailMessage.Body = new TextPart("plain")
            {
                Text = $"Click the link below to reset your password:\n{resetLink}"
            };

            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                await client.ConnectAsync("localhost", 25, false);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }
        private string GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("3df71105add26312e4d2ade913d181b525a647b0179d16fbf7d8771ff5f72df2");
            var securityKey = new SymmetricSecurityKey(key);
            securityKey.KeyId = "3df71105";
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(60),
                SigningCredentials = new SigningCredentials(securityKey,
                SecurityAlgorithms.HmacSha256Signature),
                Issuer = "localhost",
                Audience = "localhost",
                Audiences = { "localhost" }
            };
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }
        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }
        #endregion
    }
    #region DTO/Helper Classes
    public class GoogleAuthRequest
    {
        public string IdToken { get; set; }
    }
    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }

    public class UserDTO
    { 
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
    
    public class LoginDTO
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string Password { get; set; }
    }

    public class RefreshTokenRequestDTO
    {
        public string RefreshToken { get; set; }
    }
    public class RefreshTokenResponseDTO
    {
        public string Token {  get; set; }
        public string RefreshToken { get; set; }
    }
    #endregion
}
