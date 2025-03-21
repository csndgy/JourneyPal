using JourneyPalBackend.Models;
using Moq;
using Newtonsoft.Json;
using System.Net;
using System.Text;

namespace JourneyPalAdminUnitTest
{
    public class ApiServiceTests
    {
        public class ApiServiceTests
        {
            private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
            private readonly HttpClient _mockHttpClient;
            private readonly ApiService _apiService;

            public ApiServiceTests()
            {
                // Mock the HttpClient and HttpMessageHandler
                _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
                _mockHttpClient = new HttpClient(_mockHttpMessageHandler.Object)
                {
                    BaseAddress = new Uri("https://localhost:7193/")
                };

                // Initialize ApiService with the mocked HttpClient
                _apiService = new ApiService("https://localhost:7193/")
                {
                    httpClient = _mockHttpClient
                };
            }

            // Test 1: Constructor initializes HttpClient with the correct base address
            [Fact]
            public void Constructor_InitializesHttpClientWithBaseAddress()
            {
                // Arrange
                var baseUrl = "https://localhost:7193/";

                // Act
                var apiService = new ApiService(baseUrl);

                // Assert
                Assert.NotNull(apiService.httpClient);
                Assert.Equal(baseUrl, apiService.httpClient.BaseAddress.ToString());
            }

            // Test 2: SetJwtTokens sets the JWT token in the environment and HttpClient headers
            [Fact]
            public void SetJwtTokens_SetsTokenInEnvironmentAndHttpClientHeaders()
            {
                // Arrange
                var token = "test-jwt-token";
                var refreshToken = "test-refresh-token";

                // Act
                _apiService.SetJwtTokens(token, refreshToken);

                // Assert
                Assert.Equal(token, Environment.GetEnvironmentVariable("token"));
                Assert.Equal(refreshToken, Environment.GetEnvironmentVariable("refreshToken"));
                Assert.Equal("Bearer test-jwt-token", _apiService.httpClient.DefaultRequestHeaders.Authorization.ToString());
            }

            // Test 3: GetJwtToken returns the correct JWT token from the environment
            [Fact]
            public void GetJwtToken_ReturnsCorrectTokenFromEnvironment()
            {
                // Arrange
                var token = "test-jwt-token";
                Environment.SetEnvironmentVariable("token", token);

                // Act
                var result = _apiService.GetJwtToken();

                // Assert
                Assert.Equal(token, result);
            }

            // Test 4: GetRefreshToken returns the correct refresh token from the environment
            [Fact]
            public void GetRefreshToken_ReturnsCorrectRefreshTokenFromEnvironment()
            {
                // Arrange
                var refreshToken = "test-refresh-token";
                Environment.SetEnvironmentVariable("refreshToken", refreshToken);

                // Act
                var result = _apiService.GetRefreshToken();

                // Assert
                Assert.Equal(refreshToken, result);
            }

            // Test 5: GetAllUsersAsync returns a list of users
            [Fact]
            public async Task GetAllUsersAsync_ReturnsListOfUsers()
            {
                // Arrange
                var users = new List<User>
            {
                new User { Id = "1", UserName = "user1", Email = "user1@example.com" },
                new User { Id = "2", UserName = "user2", Email = "user2@example.com" }
            };

                var response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(users), Encoding.UTF8, "application/json")
                };

                _mockHttpMessageHandler.SetupRequest(HttpMethod.Get, "api/Admin/users")
                                      .ReturnsAsync(response);

                // Act
                var result = await _apiService.GetAllUsersAsync();

                // Assert
                Assert.NotNull(result);
                Assert.Equal(2, result.Count);
                Assert.Equal("user1", result[0].UserName);
                Assert.Equal("user2", result[1].UserName);
            }

            // Test 6: GetUserByIdAsync returns a user by ID
            [Fact]
            public async Task GetUserByIdAsync_ReturnsUserById()
            {
                // Arrange
                var user = new User { Id = "1", UserName = "user1", Email = "user1@example.com" };

                var response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(user), Encoding.UTF8, "application/json")
                };

                _mockHttpMessageHandler.SetupRequest(HttpMethod.Get, "api/Admin/user-by-id/1")
                                      .ReturnsAsync(response);

                // Act
                var result = await _apiService.GetUserByIdAsync("1");

                // Assert
                Assert.NotNull(result);
                Assert.Equal("user1", result.UserName);
                Assert.Equal("user1@example.com", result.Email);
            }

            // Test 7: UpdateUserAsync updates a user successfully
            [Fact]
            public async Task UpdateUserAsync_UpdatesUserSuccessfully()
            {
                // Arrange
                var updatedUser = new User { Id = "1", UserName = "updatedUser", Email = "updated@example.com" };

                var response = new HttpResponseMessage(HttpStatusCode.OK);

                _mockHttpMessageHandler.SetupRequest(HttpMethod.Put, "api/Admin/update-user/1")
                                      .ReturnsAsync(response);

                // Act
                await _apiService.UpdateUserAsync("1", updatedUser);

                // Assert
                _mockHttpMessageHandler.VerifyRequest(HttpMethod.Put, "api/Admin/update-user/1", Times.Once());
            }

            // Test 8: ResetUserPasswordAsync resets the password successfully
            [Fact]
            public async Task ResetUserPasswordAsync_ResetsPasswordSuccessfully()
            {
                // Arrange
                var newPassword = "newPassword123";

                var response = new HttpResponseMessage(HttpStatusCode.OK);

                _mockHttpMessageHandler.SetupRequest(HttpMethod.Put, "api/Admin/reset-password/1")
                                      .ReturnsAsync(response);

                // Act
                await _apiService.ResetUserPasswordAsync("1", newPassword);

                // Assert
                _mockHttpMessageHandler.VerifyRequest(HttpMethod.Put, "api/Admin/reset-password/1", Times.Once());
            }

            // Test 9: DeleteUserByUsernameAsync deletes a user by username
            [Fact]
            public async Task DeleteUserByUsernameAsync_DeletesUserByUsername()
            {
                // Arrange
                var response = new HttpResponseMessage(HttpStatusCode.OK);

                _mockHttpMessageHandler.SetupRequest(HttpMethod.Delete, "api/Admin/by-username/user1")
                                      .ReturnsAsync(response);

                // Act
                await _apiService.DeleteUserByUsernameAsync("user1");

                // Assert
                _mockHttpMessageHandler.VerifyRequest(HttpMethod.Delete, "api/Admin/by-username/user1", Times.Once());
            }

            // Test 10: DeleteUserByEmailAsync deletes a user by email
            [Fact]
            public async Task DeleteUserByEmailAsync_DeletesUserByEmail()
            {
                // Arrange
                var response = new HttpResponseMessage(HttpStatusCode.OK);

                _mockHttpMessageHandler.SetupRequest(HttpMethod.Delete, "api/admin/by-email/user1@example.com")
                                      .ReturnsAsync(response);

                // Act
                await _apiService.DeleteUserByEmailAsync("user1@example.com");

                // Assert
                _mockHttpMessageHandler.VerifyRequest(HttpMethod.Delete, "api/admin/by-email/user1@example.com", Times.Once());
            }
        }

        // Helper extension for mocking HttpClient requests
        public static class MockHttpMessageHandlerExtensions
        {
            public static Mock<HttpMessageHandler> SetupRequest(this Mock<HttpMessageHandler> handler, HttpMethod method, string requestUri)
            {
                handler.Protected()
                       .Setup<Task<HttpResponseMessage>>(
                           "SendAsync",
                           ItExpr.Is<HttpRequestMessage>(req => req.Method == method && req.RequestUri.ToString().EndsWith(requestUri)),
                           ItExpr.IsAny<CancellationToken>()
                       )
                       .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

                return handler;
            }

            public static void VerifyRequest(this Mock<HttpMessageHandler> handler, HttpMethod method, string requestUri, Times times)
            {
                handler.Protected()
                       .Verify(
                           "SendAsync",
                           times,
                           ItExpr.Is<HttpRequestMessage>(req => req.Method == method && req.RequestUri.ToString().EndsWith(requestUri)),
                           ItExpr.IsAny<CancellationToken>()
                       );
            }
        }
    }
}