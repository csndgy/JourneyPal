using IdentityModel.Client;
using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly JourneyPalDbContext _ctx;
        private readonly IConfiguration _conf;

        public AuthController(JourneyPalDbContext context, IConfiguration configuration)
        {
            _ctx = context;
            _conf = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (user == null || string.IsNullOrEmpty(user.Username) 
                || string.IsNullOrEmpty(user.Email) 
                || string.IsNullOrEmpty(user.PasswordHash))
            {
                return BadRequest("Invalid user data.");
            }

            if (await _ctx.Users.AnyAsync(u => u.Username == user.Username))
            {
                return BadRequest("Username is already taken!");
            }

            if (await _ctx.Users.AnyAsync(u => u.Email == user.Email))
            {
                return BadRequest("An account is already registered with this Email address!");
            }

            user.SetPassword(user.PasswordHash);
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            return Ok(new { Message = "Successful registration!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User user)
        {
            try
            {
                var existingUser = await _ctx.Users.FirstOrDefaultAsync(u => u.Username == user.Username || u.Email == user.Email);

                if (existingUser == null || !existingUser.VerifyPassword(user.PasswordHash))
                    return Unauthorized("Invalid username/email or password!");

                var token = GenerateToken(existingUser);
                var refreshToken = GenerateRefreshToken();

                existingUser.RefreshToken = refreshToken;
                existingUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(int.Parse(_conf["Jwt:RefreshTokenExpiryDays"]));
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
            var user = _ctx.Users.FirstOrDefault(u => u.Username == username);

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
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return BadRequest("User not found.");

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = DateTime.MinValue;

            await _ctx.SaveChangesAsync();

            return Ok(new { Message = "Logged out successfully." });
              
        }

        private string GenerateToken(User user)
        {
            var tokenHandler = new JsonWebTokenHandler();
            var key = Encoding.ASCII.GetBytes(_conf["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Username)
                }),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(_conf["Jwt:AccessTokenExpiryMinutes"])),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature),
                Issuer = _conf["Jwt:Issuer"],
                Audience = _conf["Jwt:Audience"]
            };

            return tokenHandler.CreateToken(tokenDescriptor);
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
                return null; //Ebből még fix lesz baj
            }

            return principal;
        }
    }
}
