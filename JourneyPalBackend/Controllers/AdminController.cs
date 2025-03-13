using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
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
    }
}
