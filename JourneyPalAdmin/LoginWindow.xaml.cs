﻿using JourneyPalAdmin.Utils;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;


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

            this.MouseLeftButtonDown += (sender, e) => {
                if (e.ButtonState == System.Windows.Input.MouseButtonState.Pressed)
                    this.DragMove();
            };
        }
        private void CloseWindow_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                Application.Current.Shutdown();
            });
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

            var mainWindow = new MainWindow(_apiService);
            mainWindow.Show();
            this.Close();
        }
        private void PasswordReveal_Checked(object sender, RoutedEventArgs e)
        {
            VisiblePassword.Text = PasswordBox.Password;
            VisiblePassword.Visibility = Visibility.Visible;
            PasswordBox.Visibility = Visibility.Collapsed;
        }

        private void PasswordReveal_Unchecked(object sender, RoutedEventArgs e)
        {
            PasswordBox.Password = VisiblePassword.Text;
            PasswordBox.Visibility = Visibility.Visible;
            VisiblePassword.Visibility = Visibility.Collapsed;
        }
    }

    public class JwtResponse
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
