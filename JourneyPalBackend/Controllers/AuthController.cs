using Google.Apis.Auth;
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

        public AuthController(JourneyPalDbContext context, IConfiguration configuration, UserManager<User> userManager)
        {
            _ctx = context;
            _conf = configuration;
            _userManager = userManager;
        }
        #endregion

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
                EmailConfirmed = true
            };
            await _ctx.SaveChangesAsync();
            await _userManager.CreateAsync(newUser, user.Password);
            return Ok(new { Message = "Successful registration!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO user)
        {
            try
            {
                User userExistsByEmail = null;
                User userExistsByName = null;
                byte signal = 2;

                if (!String.IsNullOrEmpty(user.Email))
                {
                    userExistsByEmail = await _userManager.FindByEmailAsync(user.Email);
                    if (userExistsByEmail == null)
                    {
                        return BadRequest("A user with this email does not exist.");
                    }
                    else
                    {
                        if (!await _userManager.CheckPasswordAsync(userExistsByEmail, user.Password))
                            return Unauthorized("Invalid credentials.");
                        signal = 0;
                    }
                }
                else if (!String.IsNullOrEmpty(user.UserName))
                {
                    userExistsByName = await _userManager.FindByNameAsync(user.UserName);
                    if (userExistsByName == null)
                    {
                        return BadRequest("A user with this username does not exist.");
                    }
                    else
                    {
                        if (!await _userManager.CheckPasswordAsync(userExistsByName, user.Password))
                            return Unauthorized("Invalid credentials.");
                        signal = 1;
                    }
                }
                else
                {
                    return BadRequest("Email or Username must be provided.");
                }

                var theChosenOne = signal == 0 ? userExistsByEmail : userExistsByName;

                var token = GenerateToken(theChosenOne);
                var refreshToken = GenerateRefreshToken();

                theChosenOne.RefreshToken = refreshToken;
                theChosenOne.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(int.Parse(_conf["Jwt:RefreshTokenExpiryDays"]));
                await _ctx.SaveChangesAsync();

                return Ok(new { Token = token, RefreshToken = refreshToken });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var refreshToken = request.RefreshToken;
            var principal = GetPrincipalFromExpiredToken(refreshToken);

            if (principal is null)
                return BadRequest("Invalid refresh token.");

            var username = principal.Identity.Name;
            var user = _ctx.Users.FirstOrDefault(u => u.UserName == username);

            if (user.RefreshToken != refreshToken
                || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return BadRequest("Invalid refresh token.");

            if (user is null)
            {
                return BadRequest("User not found.");
            }

            var newToken = GenerateToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _ctx.SaveChangesAsync();

            return Ok(new
            {
                Token = newToken,
                RefreshToken = newRefreshToken
            });
        }

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

        [HttpPost("signin-google")]
        public async Task<IActionResult> RegisterOrLoginWithGoogle([FromBody] GoogleAuthRequest request)
        {
            var payload = await ValidateGoogleToken(request.IdToken);
            if (payload == null)
                return BadRequest("Invalid Google token.");

            var email = payload.Email;
            var name = payload.Name;
            var providerUserId = payload.Subject;

            var existingUser = await _ctx.Users.FirstOrDefaultAsync(u => u.ProviderUserId == providerUserId && u.Provider == "Google");

            if (existingUser == null)
            {
                var user = new User
                {
                    Email = email,
                    UserName = email,
                    Provider = "Google",
                    ProviderUserId = providerUserId,
                    EmailConfirmed = true
                };

                _ctx.Users.Add(user);
                await _ctx.SaveChangesAsync();

                existingUser = user;
            }

            var token = GenerateToken(existingUser);
            var refreshToken = GenerateRefreshToken();

            existingUser.RefreshToken = refreshToken;
            existingUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(int.Parse(_conf["Jwt:RefreshTokenExpiryDays"]));

            await _ctx.SaveChangesAsync();

            return Ok(new { Token = token, RefreshToken = refreshToken });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Ok("If the email is registered, you will receive a password reset link.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var resetLink = $"https://localhost:5173/reset-password?token={WebUtility.UrlEncode(token)}&email={WebUtility.UrlEncode(request.Email)}";

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
                return Ok("Password reset successful.");

            return BadRequest("Password reset failed.");
        }
        #region Funny
        [HttpPost("meow")]
        public async Task<IActionResult> Meow()
        {
            return Ok("Meow!");
        }
        [HttpPost("I'm a teapot")]
        public async Task<IActionResult> ImATeapot()
        {
            return StatusCode(418, "I'm a teapot!");
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
            var tokenHandler = new JsonWebTokenHandler();
            var key = Encoding.ASCII.GetBytes(_conf["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.UserName)
                }),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_conf["Jwt:AccessTokenExpiryMinutes"])),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
                Issuer = _conf["Jwt:Issuer"],
                Audience = _conf["Jwt:Audience"]
            };

            return tokenHandler.CreateToken(tokenDescriptor);
        }
        private async Task<GoogleJsonWebSignature.Payload> ValidateGoogleToken(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _conf["Authentication:Google:ClientId"] }
                };

                return await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            }
            catch
            {
                return null;
            }
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

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _conf["Jwt:Issuer"],
                ValidAudience = _conf["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_conf["Jwt:Key"]))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters,
                out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256Signature, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
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
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
    #endregion
}
