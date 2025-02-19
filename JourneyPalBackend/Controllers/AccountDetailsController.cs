using JourneyPalBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JourneyPalBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    [Authorize("token")]
    public class AccountDetailsController : ControllerBase
    {
        private readonly JourneyPalDbContext _ctx;
        private readonly UserManager<User> _userManager;
        public AccountDetailsController(JourneyPalDbContext context, UserManager<User> userManager)
        {
            _ctx = context;
            _userManager = userManager;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetAccountDetails()
        {
            Console.WriteLine("!!!!!!!!!!!!!!");
            Console.WriteLine(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
             

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _ctx.Users
               .Where(u => u.Id == userId)
               .Select(u => new
               {
                   u.Id,
                   u.UserName,
                   u.Email,
                   u.Telephone,
               })
               .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }
    }
}
