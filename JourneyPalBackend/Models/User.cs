using Microsoft.AspNetCore.Identity;

namespace JourneyPalBackend.Models
{
    public class User : IdentityUser
    {
        public string RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        public List<string> RecoveryCodes { get; set; } = new List<string>();
        public string Provider { get; set; } 
        public string ProviderUserId { get; set; }
        public virtual ICollection<Trip> Trips { get; set; }
        public string Role { get; set; } = "User";

        public void SetPassword(string password)
        {
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
        }
    }
}
