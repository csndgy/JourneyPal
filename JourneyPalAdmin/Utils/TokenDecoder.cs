using System.IdentityModel.Tokens.Jwt;

namespace JourneyPalAdmin.Utils
{
    public class TokenDecoder
    {
        public static string DecodeUserToken(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();

                var jwtToken = handler.ReadJwtToken(token);

                var claims = jwtToken.Claims;

                var roleClaim = claims.FirstOrDefault(c => c.Type == "role");

                if (roleClaim != null)
                {
                    return roleClaim.Value;
                }
                else
                {
                    throw new Exception("Role claim not found in the token.");
                }
            } catch (Exception ex)
            {
                throw new Exception("Failed to decode token: " + ex.Message);
            }
        }
    }
}
