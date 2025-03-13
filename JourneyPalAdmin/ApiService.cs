using System.Net.Http.Headers;
using System.Net.Http;
using JourneyPalAdmin.Models;
using Newtonsoft.Json;
namespace JourneyPalAdmin
{
    //public class TokenStore
    //{
    //    public TokenStore(string token, string refreshToken)
    //    {
    //        JwtToken = token;
    //        RefreshToken = refreshToken;
    //    }
    //    public string JwtToken { get; set; }
    //    public string RefreshToken { get; set; }

    //    public void SetRefreshToken(string refreshToken)
    //    {
    //        RefreshToken = refreshToken;
    //    }

    //    public void SetJwtToken(string token)
    //    {
    //        JwtToken = token;
    //    }
    //}

    public class ApiService
    {
        public HttpClient httpClient { get; }
        private readonly HttpClient _httpClient;
        private string _jwtToken { get; set; }
        private string _refreshToken { get; set; }

        public ApiService(string baseUrl)
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(baseUrl)
            };
            httpClient = new HttpClient
            {
                BaseAddress = new Uri(baseUrl)
            };
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public void SetJwtTokens(string token, string refreshToken)
        {
            Environment.SetEnvironmentVariable("token", token);
            Environment.SetEnvironmentVariable("refreshToken", refreshToken);
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Environment.GetEnvironmentVariable("token"));
        }
        
        public string GetRefreshToken()
        {
            return Environment.GetEnvironmentVariable("refreshtToken");
        }

        public string GetJwtToken()
        {
            return Environment.GetEnvironmentVariable("token");
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            var response = await _httpClient.GetAsync("api/Admin/users");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task<List<User>> GetUserByEmailAsync(string email)
        {
            var response = await _httpClient.GetAsync($"api/Admin/user-by-email?email={email}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task<List<User>> GetUserByNameAsync(string username)
        {
            var response = await _httpClient.GetAsync($"api/Admin/user-by-name?username={username}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task DeleteUserByUsernameAsync(string username)
        {
            var response = await _httpClient.DeleteAsync($"api/Admin/by-username/{username}");
            response.EnsureSuccessStatusCode();
        }

        public async Task DeleteUserByEmailAsync(string email)
        {
            var response = await _httpClient.DeleteAsync($"api/admin/by-email/{email}");
            response.EnsureSuccessStatusCode();
        }
    }
}
