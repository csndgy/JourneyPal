using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin")]
    
    public class AdminController : Controller
    {
        private readonly JourneyPalDbContext _ctx;
        private readonly UserManager<User> _userManager;

        public AdminController(JourneyPalDbContext ctx, UserManager<User> userManager)
        {
            _ctx = ctx;
            _userManager = userManager;
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            return await _ctx.Users.ToListAsync();
        }

        [HttpGet("user-by-email")]
        public async Task<ActionResult<IEnumerable<User>>> GetUserByEmail([FromQuery] string email)
        {
            var query = _ctx.Users.AsQueryable();

            if (!string.IsNullOrEmpty(email))
            {
                query = query.Where(u => u.Email.ToLower() == email.ToLower());
            }

            var users = await query.ToListAsync();

            if (users == null || !users.Any())
            {
                return NotFound("No users found with the specified criteria.");
            }

            return users;
        }

        [HttpGet("user-by-id/{id}")]
        public async Task<ActionResult<User>> GetUserById(string id)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }
            return user;
        }

        [HttpGet("user-by-name")]
        public async Task<ActionResult<IEnumerable<User>>> GetUserByName([FromQuery] string username)
        {
            var query = _ctx.Users.AsQueryable();

            if (!string.IsNullOrEmpty(username))
            {
                query = query.Where(u => username.ToLower() == username.ToLower());
            }

            var users = await query.ToListAsync();

            if (users == null || !users.Any())
            {
                return NotFound("No users found with the specified criteria.");
            }

            return users;
        }
        [HttpDelete("by-username/{username}")]
        public async Task<IActionResult> DeleteUserByUsername(string username)
        {
            var user = await _ctx.Users
                            .Include(u => u.Trips)
                            .FirstOrDefaultAsync(u => u.UserName.ToLower() == username.ToLower());

            if (user == null)
            {
                return NotFound($"User with username '{username}' not found.");
            }

            _ctx.Users.Remove(user);
            await _userManager.DeleteAsync(user);
            await _ctx.SaveChangesAsync();

            return NoContent(); 
        }

        [HttpDelete("by-email/{email}")]
        public async Task<IActionResult> DeleteUserByEmail(string email)
        {
            var user = await _ctx.Users
                            .Include(u => u.Trips)
                            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

            if (user == null)
            {
                return NotFound($"User with email '{email}' not found.");
            }

            _ctx.Users.Remove(user);
            await _userManager.DeleteAsync(user);
            await _ctx.SaveChangesAsync();

            return NoContent(); 
        }
        [HttpPut("update-user/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateDTO updatedUser)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }



            user.UserName = string.IsNullOrEmpty(updatedUser.Username) ? user.UserName : updatedUser.Username;
            user.Email = string.IsNullOrEmpty(updatedUser.Email) ? user.Email : updatedUser.Email;
            user.PhoneNumber = string.IsNullOrEmpty(updatedUser.PhoneNumber) ? user.PhoneNumber : updatedUser.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok($"Successfully updated user!");
        }
        [HttpPut("reset-password/{id}")]
        public async Task<IActionResult> ResetUserPassword(string id, [FromBody] string newPassword)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }

            // Reset password
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            var users = await _userManager.FindByIdAsync(id);
            users.RefreshToken = null;
            users.RefreshTokenExpiryTime = DateTime.MinValue;

            return Ok("Password reset successfully.");
        }

        public class UserUpdateDTO
        {
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? PhoneNumber { get; set; }

        }
    }
}
