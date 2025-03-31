using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace JourneyPalBackend.Utils
{
    public class HelperClass
    {
        public static TokenValidationParameters GetTokenValidationParameters()
        {
            return new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("3df71105add26312e4d2ade913d181b525a647b0179d16fbf7d8771ff5f72df2"))
                {
                    KeyId = "3df71105"
                },
                ValidateIssuer = true,
                ValidIssuer = "localhost",
                ValidateAudience = false,
                ValidAudience = "localhost",
                ValidAudiences = new List<string> { "localhost" },
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        }
    }
}
