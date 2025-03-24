using System.Net.Http.Headers;
using System.Net.Http;
using System.Text;
using System.Windows;
using Newtonsoft.Json;
using JourneyPalAdmin.Models;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Collections.ObjectModel;
using System.Windows.Threading;
using System.Formats.Asn1;


namespace JourneyPalAdmin
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private readonly ApiService _apiService;
        private readonly DispatcherTimer _refreshTimer;
        public ObservableCollection<User> Users { get; set; }

        public MainWindow(ApiService apiService)
        {
            InitializeComponent();
            _apiService = apiService;
            Users = new ObservableCollection<User>();
            DataContext = this;

            Loaded += MainWindow_Loaded;

            _refreshTimer = new DispatcherTimer();
            _refreshTimer.Interval = TimeSpan.FromSeconds(30); // Refresh every 30 seconds
            _refreshTimer.Tick += RefreshTimer_Tick;
            _refreshTimer.Start(); // Start the timer
            MessageBox.Show($"{_apiService.GetJwtToken()}");
            Clipboard.SetText(_apiService.GetJwtToken());
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                var users = await _apiService.GetAllUsersAsync();
                foreach (var user in users)
                {
                    Users.Add(user);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }  
        }

        private async void RefreshTimer_Tick(object sender, EventArgs e)
        {
            await FetchUsers(); // Fetch users periodically
        }

        private async void Logout_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Stop the refresh timer
                _refreshTimer.Stop();

                // Call the API logout
                var success = await _apiService.LogoutAsync();

                if (success)
                {
                    MessageBox.Show("Logged out successfully.", "Success", MessageBoxButton.OK, MessageBoxImage.Information);

                    // Reopen the LoginWindow and close the current MainWindow
                    var loginWindow = new LoginWindow(); // Replace with your actual LoginWindow class
                    loginWindow.Show();
                    this.Close(); // Close the current MainWindow
                }
                else
                {
                    MessageBox.Show("Logout failed but local session was cleared.", "Warning", MessageBoxButton.OK, MessageBoxImage.Warning);
                    var loginWindow = new LoginWindow(); // Fallback: still reopen LoginWindow
                    loginWindow.Show();
                    this.Close();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error during logout: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                // Fallback: reopen LoginWindow even if an error occurs
                var loginWindow = new LoginWindow();
                loginWindow.Show();
                this.Close();
            }
        }

        private async void LoadUsers_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var users = await _apiService.GetAllUsersAsync();
                Users.Clear(); 
                foreach (var user in users)
                {
                    Users.Add(user);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task FetchUsers()
        {
            try
            {
                do
                {
                    var users = await _apiService.GetAllUsersAsync();
                    Users.Clear();
                    foreach (var user in users)
                    {
                        Users.Add(user);
                    }
                } while (true);
                
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }


        private async void DeleteUserByUsername_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var username = UsernameTextBox.Text;
                await _apiService.DeleteUserByUsernameAsync(username);
                UsernameTextBox.Clear();
                MessageBox.Show("User deleted successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                try
                {
                    var users = await _apiService.GetAllUsersAsync();
                    Users.Clear();
                    foreach (var user in users)
                    {
                        Users.Add(user);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void DeleteSelectedUser_Click(object sender, RoutedEventArgs e)
        {
            if (UsersDataGrid.SelectedIndex == -1)
            {
                MessageBox.Show("Error: No rows were selected.", "Error: No selected row", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
            else
            {
                User selectedUser = UsersDataGrid.SelectedItem as User;
                var email = selectedUser.Email;
                try
                {
                    await _apiService.DeleteUserByEmailAsync(email);
                    MessageBox.Show("User deleted successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                    try
                    {
                        var users = await _apiService.GetAllUsersAsync();
                        Users.Clear();
                        foreach (var user in users)
                        {
                            Users.Add(user);
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private async void DeleteUserByEmail_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var email = EmailTextBox.Text;
                await _apiService.DeleteUserByEmailAsync(email);
                MessageBox.Show("User deleted successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                EmailTextBox.Clear();
                try
                {
                    var users = await _apiService.GetAllUsersAsync();
                    Users.Clear();
                    foreach (var user in users)
                    {
                        Users.Add(user);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        private async void UpdateUser_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var userId = UserIdTextBox.Text;
                if (string.IsNullOrEmpty(userId))
                {
                    MessageBox.Show("The \"userID input\" field is empty. \nPlease provide a userID.", "Empty ID field", MessageBoxButton.OK, MessageBoxImage.Warning);
                    UserIdTextBox.Focus();
                    return;
                }
                var currentUser = await _apiService.GetUserByIdAsync(userId); // Assuming you have a method to fetch a user by ID
                if (currentUser == null)
                {
                    MessageBox.Show("User not found.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                var updatedUser = new User
                {
                    UserName = !string.IsNullOrEmpty(NewUsernameTextBox.Text) ? NewUsernameTextBox.Text : currentUser.UserName,
                    Email = !string.IsNullOrEmpty(NewEmailTextBox.Text) ? NewEmailTextBox.Text : currentUser.Email,
                    PhoneNumber = !string.IsNullOrEmpty(NewPhoneNumberTextBox.Text) ? NewPhoneNumberTextBox.Text : currentUser.PhoneNumber
                };
                // Call the API to update the user
                await _apiService.UpdateUserAsync(userId, updatedUser);
                MessageBox.Show("User updated successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                NewUsernameTextBox.Clear();
                NewEmailTextBox.Clear();
                NewPhoneNumberTextBox.Clear();
                UserIdTextBox.Clear();

            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        private async void ResetPassword_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var userId = UserIdTextBox.Text;
                var newPassword = NewPasswordTextBox.Text;

                if (string.IsNullOrEmpty(userId))
                {
                    MessageBox.Show("The \"userID input\" field is empty. \nPlease provide a userID.", "Empty ID field", MessageBoxButton.OK, MessageBoxImage.Warning);
                    UserIdTextBox.Focus();
                    return;
                }
                else if (string.IsNullOrEmpty(newPassword))
                {
                    MessageBox.Show("The \"new password\" input field is empty. \nPlease provide a new password for the specified user ID.", "Empty Password field", MessageBoxButton.OK, MessageBoxImage.Warning);
                    NewPasswordTextBox.Focus();
                    return;
                }
                await _apiService.ResetUserPasswordAsync(userId, newPassword);
                MessageBox.Show("Password reset successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                UserIdTextBox.Clear();
                NewPasswordTextBox.Clear();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        private void CopyCellContent_Click(object sender, RoutedEventArgs e)
        {
            if (UsersDataGrid.SelectedIndex != -1)
            {
                var cellContent = UsersDataGrid.CurrentCell.Column.GetCellContent(UsersDataGrid.CurrentCell.Item);
                if (cellContent is TextBlock textBlock)
                {
                    Clipboard.SetText(textBlock.Text);
                    MessageBox.Show("Copied to clipboard: " + textBlock.Text, "Success", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
        }
    }
}