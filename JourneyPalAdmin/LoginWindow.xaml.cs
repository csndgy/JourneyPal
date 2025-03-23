using JourneyPalAdmin.Utils;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using System.Windows;
using System.Windows.Controls;


namespace JourneyPalAdmin
{
    /// <summary>
    /// Interaction logic for LoginWindow.xaml
    /// </summary>
    public partial class LoginWindow : Window
    {
        private readonly ApiService _apiService;

        public LoginWindow()
        {
            InitializeComponent();
            _apiService = new ApiService("https://localhost:7193/");
            UsernameTextBox.Text = "admin";
            PasswordBox.Password = "asdASD123#";
        }

        private async void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            string username = UsernameTextBox.Text;
            string password = PasswordBox.Password;

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                MessageBox.Show("Please enter both username and password.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            try
            {
                var loginData = new { userName = username, password = password };
                var content = new StringContent(JsonConvert.SerializeObject(loginData), Encoding.UTF8, "application/json");
                var response = await _apiService.httpClient.PostAsync("api/auth/login", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseData = await response.Content.ReadAsStringAsync();
                    var tokenResponse = JsonConvert.DeserializeObject<JwtResponse>(responseData);

                    try
                    {
                        string userRole = TokenDecoder.DecodeUserToken(tokenResponse.Token);

                        if (userRole != "Admin")
                        {
                            MessageBox.Show("You don't have permission to log in.", "Error: Not an Admin", MessageBoxButton.OK, MessageBoxImage.Error);
                            return;
                        }
                        else
                        {
                            LoginUser(tokenResponse.Token, tokenResponse.RefreshToken);
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Error: {ex.Message}");
                    }

                   
                }
                else
                {
                    MessageBox.Show("Login failed. Please check your credentials.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}\nInner Exception: {ex.InnerException?.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void LoginUser(string token, string refreshToken)
        {
            _apiService.SetJwtTokens(token, refreshToken);

            var mainWindow = new MainWindow();
            mainWindow.Show();
            this.Close();
        }
    }

    public class JwtResponse
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
