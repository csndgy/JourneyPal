using System.Net.Http.Headers;
using System.Net.Http;
using JourneyPalAdmin.Models;
using Newtonsoft.Json;
namespace JourneyPalAdmin
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private string _jwtToken;

        public ApiService(string baseUrl)
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(baseUrl)
            };
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public void SetJwtToken(string token)
        {
            _jwtToken = token;
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _jwtToken);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            var response = await _httpClient.GetAsync("api/admin/users");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task<List<User>> GetUserByEmailAsync(string email)
        {
            var response = await _httpClient.GetAsync($"api/admin/user-by-email?email={email}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task<List<User>> GetUserByNameAsync(string username)
        {
            var response = await _httpClient.GetAsync($"api/admin/user-by-name?username={username}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task DeleteUserByUsernameAsync(string username)
        {
            var response = await _httpClient.DeleteAsync($"api/admin/by-username/{username}");
            response.EnsureSuccessStatusCode();
        }

        public async Task DeleteUserByEmailAsync(string email)
        {
            var response = await _httpClient.DeleteAsync($"api/admin/by-email/{email}");
            response.EnsureSuccessStatusCode();
        }
    }
}
