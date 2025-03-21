using System.Net.Http.Headers;
using System.Net.Http;
using JourneyPalAdmin.Models;
using Newtonsoft.Json;
using System.Text;
namespace JourneyPalAdmin
{
    public class ApiService
    {
        public HttpClient httpClient { get; }
        private readonly HttpClient _httpClient;
        private string _jwtToken { get; set; }
        private string _refreshToken { get; set; }

        public ApiService(string baseUrl)
        {
            HttpClientHandler handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;
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
        public async Task<User> GetUserByIdAsync(string id)
        {
            var response = await _httpClient.GetAsync($"api/Admin/user-by-id/{id}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<User>(content);
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
        public async Task UpdateUserAsync(string id, User updatedUser)
        {
            var json = JsonConvert.SerializeObject(updatedUser);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync($"api/Admin/update-user/{id}", content);
            response.EnsureSuccessStatusCode();
        }
        public async Task ResetUserPasswordAsync(string id, string newPassword)
        {
            var json = JsonConvert.SerializeObject(newPassword);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync($"api/Admin/reset-password/{id}", content);
            response.EnsureSuccessStatusCode();
        }
    }
}
