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
using System.ComponentModel.DataAnnotations;

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

            var data = new UserRequestObject
            {
                Username = user.UserName,
                Email = user.Email,
                Telephone = user.PhoneNumber

            };

            return Ok(data);
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
        [HttpPatch("change-password")]
        public async Task<IActionResult> ChangePassword([FromQuery] string nameId, ChangePasswordRequest request)
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

            // Verify current password
            var passwordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!passwordValid)
            {
                return BadRequest("Current password is incorrect.");
            }

            // Manual validation to match your specific requirements
            var errors = new List<string>();

            if (request.NewPassword.Length < 8)
                errors.Add("Password must be at least 8 characters long.");

            if (!Regex.IsMatch(request.NewPassword, @"\d"))
                errors.Add("Password must contain at least one digit (0-9).");

            if (!Regex.IsMatch(request.NewPassword, @"[a-z]"))
                errors.Add("Password must contain at least one lowercase letter (a-z).");

            if (!Regex.IsMatch(request.NewPassword, @"[A-Z]"))
                errors.Add("Password must contain at least one uppercase letter (A-Z).");

            if (!Regex.IsMatch(request.NewPassword, @"[^a-zA-Z0-9]"))
                errors.Add("Password must contain at least one non-alphanumeric character.");

            if (errors.Any())
            {
                return BadRequest(string.Join(" ", errors));
            }

            // Change password
            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(string.Join(" ", result.Errors.Select(e => e.Description)));
            }

            return Ok("Password changed successfully.");
        }
    }
    #region DTO/Helper Classes
    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Current password is required.")]
        public string CurrentPassword { get; set; }

        [Required(ErrorMessage = "New password is required.")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Confirmation password is required.")]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

    public class UpdatePhoneRequest
    {
        public string PhoneNumber { get; set; }
    }

    public class UserRequestObject
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string? Telephone { get; set; }
    }
    #endregion
}
