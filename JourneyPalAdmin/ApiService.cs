﻿using System.Net.Http.Headers;
using System.Net.Http;
using JourneyPalAdmin.Models;
using Newtonsoft.Json;
using System.Text;
using System;

namespace JourneyPalAdmin
{
    public class ApiService
    {
        public HttpClient httpClient { get; set; }
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
            _jwtToken = token;
            _refreshToken = refreshToken;
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        public string GetRefreshToken()
        {
            return _refreshToken;
        }

        public string GetJwtToken()
        {
            return _jwtToken;
        }

        public async Task<bool> RefreshTokenAsync()
        {
            try
            {
                if (string.IsNullOrEmpty(_refreshToken))
                    return false;

                var content = new StringContent(JsonConvert.SerializeObject(_refreshToken), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("api/Auth/refresh", content);

                if (!response.IsSuccessStatusCode)
                    return false;

                var responseContent = await response.Content.ReadAsStringAsync();
                var tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);

                SetJwtTokens(tokenResponse.Token, tokenResponse.RefreshToken);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private async Task<HttpResponseMessage> ExecuteWithTokenRefresh(Func<Task<HttpResponseMessage>> apiCall)
        {
            var response = await apiCall();
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                if (await RefreshTokenAsync())
                {
                    response = await apiCall();
                }
                else
                {
                    throw new UnauthorizedAccessException("Session expired. Please login again.");
                }
            }
            return response;
        }

        public async Task<bool> LogoutAsync()
        {
            try
            {
                var response = await ExecuteWithTokenRefresh(() => _httpClient.PostAsync("api/Auth/logout", null));
                response.EnsureSuccessStatusCode();

                _jwtToken = null;
                _refreshToken = null;
                _httpClient.DefaultRequestHeaders.Authorization = null;

                return true;
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch
            {
                _jwtToken = null;
                _refreshToken = null;
                _httpClient.DefaultRequestHeaders.Authorization = null;
                return false;
            }
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            var response = await ExecuteWithTokenRefresh(() => _httpClient.GetAsync("api/Admin/users"));
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task<User> GetUserByIdAsync(string id)
        {
            var response = await ExecuteWithTokenRefresh(() => _httpClient.GetAsync($"api/Admin/user-by-id/{id}"));
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<User>(content);
        }

        public async Task<List<User>> GetUserByEmailAsync(string email)
        {
            var response = await ExecuteWithTokenRefresh(() => _httpClient.GetAsync($"api/Admin/user-by-email?email={email}"));
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task<List<User>> GetUserByNameAsync(string username)
        {
            var response = await ExecuteWithTokenRefresh(() => _httpClient.GetAsync($"api/Admin/user-by-name?username={username}"));
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(content);
        }

        public async Task DeleteUserByUsernameAsync(string username)
        {
            var response = await ExecuteWithTokenRefresh(() => _httpClient.DeleteAsync($"api/Admin/by-username/{username}"));
            response.EnsureSuccessStatusCode();
        }

        public async Task DeleteUserByEmailAsync(string email)
        {
            var response = await ExecuteWithTokenRefresh(() => _httpClient.DeleteAsync($"api/admin/by-email/{email}"));
            response.EnsureSuccessStatusCode();
        }

        public async Task UpdateUserAsync(string id, User updatedUser)
        {
            var json = JsonConvert.SerializeObject(updatedUser);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await ExecuteWithTokenRefresh(() => _httpClient.PutAsync($"api/Admin/update-user/{id}", content));
            response.EnsureSuccessStatusCode();
        }

        public async Task ResetUserPasswordAsync(string id, string newPassword)
        {
            var json = JsonConvert.SerializeObject(newPassword);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await ExecuteWithTokenRefresh(() => _httpClient.PutAsync($"api/Admin/reset-password/{id}", content));
            response.EnsureSuccessStatusCode();
        }

        public async Task<bool> LoginAsync(string username, string password)
        {
            try
            {
                var loginRequest = new LoginRequest
                {
                    Username = username,
                    Password = password
                };

                var json = JsonConvert.SerializeObject(loginRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("api/Auth/login", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var tokenResponse = JsonConvert.DeserializeObject<TokenResponse>(responseContent);

                SetJwtTokens(tokenResponse.Token, tokenResponse.RefreshToken);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public class TokenResponse
        {
            public string Token { get; set; }
            public string RefreshToken { get; set; }
        }

        public class LoginRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }
    }
}