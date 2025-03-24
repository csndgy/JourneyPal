using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace JourneyPalBackend.Utils
{
    public class HelperClass
    {
        public static TokenValidationParameters GetTokenValidationParameters(IConfiguration conf)
        {
            return new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(conf["Jwt:Key"])) 
                { 
                    KeyId = "3df71105" 
                },
                ValidateIssuer = true,
                ValidIssuer = conf["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = conf["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        }
    }
}
