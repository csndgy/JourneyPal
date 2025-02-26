public Fin<Guid> ValidateAccessToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Secret"]!);

        var validationParameters = new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAudience =_config["Jwt:Audience"],
            ValidIssuer = _config["Jwt:Issuer"]!,
            ValidateIssuerSigningKey = true,
            ValidateAudience = true,
            ValidateIssuer = true,
            ClockSkew = TimeSpan.Zero,
        };

        var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

        if(validatedToken is not JwtSecurityToken jwtToken || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256Signature))
            return Error.New("Invalid token algorithm.");

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid userId)
            ? Error.New("User Id is missing or invalid in the token.")
            : userId;
    }
