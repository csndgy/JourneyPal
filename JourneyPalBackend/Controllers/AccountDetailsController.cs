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
using System.Text.RegularExpressions;
using JourneyPalBackend.Utils;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    [Authorize(AuthenticationSchemes = "Bearer")]

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
        public async Task<IActionResult> GetAccountDetails([FromQuery] string nameId)
        {
            var authHeader = Request.Headers.Authorization.FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Missing or invalid authorization token.");
            }

            var user = await _userManager.FindByIdAsync(nameId);

            //var user = await _ctx.Users
            //   .Where(u => u.Id == userId)
            //   .Select(u => new
            //   {
            //       u.Id,
            //       u.UserName,
            //       u.Email,
            //       u.PhoneNumber,
            //   })
            //   .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }
        [HttpPatch("update-phone")]
        public async Task<IActionResult> UpdateUserPhoneNumber([FromQuery] string nameId, UpdatePhoneRequest request)
        {

            var authHeader = Request.Headers.Authorization.FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Missing or invalid authorization token.");
            }

            var user = await _userManager.FindByIdAsync(nameId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (!IsValidPhoneNumber(request.PhoneNumber))
            {
                return BadRequest("Invalid phone number format.");
            }

            user.PhoneNumber = request.PhoneNumber;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest("Failed to update phone number.");
            }

            return Ok("Phone number updated successfully.");
        }
        private bool IsValidPhoneNumber(string phoneNumber)
        {
            var phoneNumberPattern = @"^\+?[1-9]\d{1,14}$";
            return Regex.IsMatch(phoneNumber, phoneNumberPattern);
        }
        private string ValidateAccessToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes("3df71105add26312e4d2ade913d181b525a647b0179d16fbf7d8771ff5f72df2s");

                var validIssuer = "localhost";
                var validAudience = "localhost";

                var validationParameters = HelperClass.GetTokenValidationParameters();

                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

                foreach (var claim in principal.Claims)
                {
                    Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
                }

                if (validatedToken is not JwtSecurityToken jwtToken || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256))
                    return "Invalid token!";

                return principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new SecurityTokenException("User ID not found in token"); //"Error, token invalid or not found!";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation failed: {ex.Message}");
                return "Invalid token!";
            }

        }
    }
    public class UpdatePhoneRequest
    {
        public string PhoneNumber { get; set; }
    }
}
