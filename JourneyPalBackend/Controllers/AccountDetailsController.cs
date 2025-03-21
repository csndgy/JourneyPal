using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    
    public class AccountDetailsController : ControllerBase
    {
        private readonly JourneyPalDbContext _ctx;
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _conf;
        public AccountDetailsController(JourneyPalDbContext context, UserManager<User> userManager, IConfiguration conf)
        {
            _ctx = context;
            _userManager = userManager;
            _conf = conf;
        }
        [HttpGet("profile")]
        public async Task<IActionResult> GetAccountDetails()
        {
            var authHeader = Request.Headers.Authorization.FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Missing or invalid authorization token.");
            }

            var token = authHeader.Substring("Bearer ".Length);

            var userId = ValidateAccessToken(token);

            var user = await _ctx.Users
               .Where(u => u.Id == userId)
               .Select(u => new
               {
                   u.Id,
                   u.UserName,
                   u.Email,
                   u.PhoneNumber,
               })
               .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }
        private string ValidateAccessToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_conf["Jwt:Key"]!);

            var validationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = new SymmetricSecurityKey(key),
                //ValidAudiences = ["localhost"],
                // ValidIssuers = ["localhost"], 
                ValidAudience = _conf["Jwt:Audience"],
                ValidIssuer = _conf["Jwt:Issuer"],
                ValidateIssuerSigningKey = false,
                ValidateAudience = false,
                ValidateIssuer = false,
                ClockSkew = TimeSpan.Zero,
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256Signature))
                return "Invalid token!";

            return principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Error, token invalid or not found!";
        }
    }
}
