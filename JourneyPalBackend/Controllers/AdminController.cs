using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize(Policy = "AdminPolicy")]
    
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
        public async Task<IActionResult> UpdateUser(string id, [FromBody] User updatedUser)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }

            // Update user properties
            user.UserName = updatedUser.UserName;
            user.Email = updatedUser.Email;
            user.PhoneNumber = updatedUser.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(user);
        }
        [HttpPatch("update-user/{id}")]
        public async Task<IActionResult> PartiallyUpdateUser(string id, [FromBody] Dictionary<string, string> updates)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }

            // Apply updates
            foreach (var update in updates)
            {
                switch (update.Key.ToLower())
                {
                    case "username":
                        user.UserName = update.Value;
                        break;
                    case "email":
                        user.Email = update.Value;
                        break;
                    case "phonenumber":
                        user.PhoneNumber = update.Value;
                        break;
                    default:
                        return BadRequest($"Invalid property '{update.Key}'.");
                }
            }

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(user);
        }
        [HttpPatch("update-user/{id}")]
        public async Task<IActionResult> PartiallyUpdateUserPW(string id, [FromBody] Dictionary<string, string> updates)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound($"User with ID '{id}' not found.");
            }

            // Apply updates
            foreach (var update in updates)
            {
                switch (update.Key.ToLower())
                {
                    case "username":
                        user.UserName = update.Value;
                        break;
                    case "email":
                        user.Email = update.Value;
                        break;
                    case "phonenumber":
                        user.PhoneNumber = update.Value;
                        break;
                    default:
                        return BadRequest($"Invalid property '{update.Key}'.");
                }
            }

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(user);
        }
    }
}
