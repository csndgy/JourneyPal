using Xunit;
using JourneyPalAdmin.Utils;
using JourneyPalAdmin.Models;

public class InputValidatorTests
{
    // Test for IsStringValid (Theory)
    [Theory]
    [InlineData(null, false, false)]
    [InlineData("", false, false)]
    [InlineData("valid", true, true)]
    [InlineData("short", false, false, 6, 10)]
    [InlineData("exactlength", true, true, 5, 11)]
    public void IsStringValid_ShouldValidateCorrectly(string input, bool allowNullOrEmpty, bool expected, int minLength = 0, int maxLength = int.MaxValue)
    {
        bool result = InputValidator.IsStringValid(input, allowNullOrEmpty, minLength, maxLength);
        Assert.Equal(expected, result);
    }

    // Test for IsEmailValid
    [Fact]
    public void IsEmailValid_ValidEmail_ReturnsTrue()
    {
        string email = "test@example.com";
        bool result = InputValidator.IsEmailValid(email);
        Assert.True(result);
    }

    [Fact]
    public void IsEmailValid_InvalidEmail_ReturnsFalse()
    {
        string email = "invalid-email";
        bool result = InputValidator.IsEmailValid(email);
        Assert.False(result);
    }

    // Test for IsPhoneNumberValid
    [Fact]
    public void IsPhoneNumberValid_ValidPhoneNumber_ReturnsTrue()
    {
        string phoneNumber = "+1234567890";
        bool result = InputValidator.IsPhoneNumberValid(phoneNumber);
        Assert.True(result);
    }

    [Fact]
    public void IsPhoneNumberValid_InvalidPhoneNumber_ReturnsFalse()
    {
        string phoneNumber = "abc123";
        bool result = InputValidator.IsPhoneNumberValid(phoneNumber);
        Assert.False(result);
    }

    // Test for IsPasswordValid
    [Fact]
    public void IsPasswordValid_ValidPassword_ReturnsTrue()
    {
        string password = "StrongPass123!";
        bool result = InputValidator.IsPasswordValid(password);
        Assert.True(result);
    }

    [Fact]
    public void IsPasswordValid_TooShortPassword_ReturnsFalse()
    {
        string password = "short";
        bool result = InputValidator.IsPasswordValid(password, minLength: 8);
        Assert.False(result);
    }
    [Theory]
    [InlineData("validUser", "test@example.com", "+1234567890", true)]
    [InlineData("", "test@example.com", "+1234567890", false)] // Empty username
    [InlineData("validUser", "invalid-email", "+1234567890", false)] // Invalid email
    [InlineData("validUser", "test@example.com", "abc123", false)] // Invalid phone
    public void IsUserValid_ShouldValidateCorrectly(string username, string email, string phone, bool expected)
    {
        var user = new User { UserName = username, Email = email, PhoneNumber = phone };
        bool result = UserHelper.IsUserValid(user);
        Assert.Equal(expected, result);
    }

    // Test for AreUsersEqual
    [Fact]
    public void AreUsersEqual_SameUsers_ReturnsTrue()
    {
        var user1 = new User { UserName = "user1", Email = "user1@example.com", PhoneNumber = "+1234567890" };
        var user2 = new User { UserName = "user1", Email = "user1@example.com", PhoneNumber = "+1234567890" };
        bool result = UserHelper.AreUsersEqual(user1, user2);
        Assert.True(result);
    }

    [Fact]
    public void AreUsersEqual_DifferentUsers_ReturnsFalse()
    {
        var user1 = new User { UserName = "user1", Email = "user1@example.com", PhoneNumber = "+1234567890" };
        var user2 = new User { UserName = "user2", Email = "user2@example.com", PhoneNumber = "+9876543210" };
        bool result = UserHelper.AreUsersEqual(user1, user2);
        Assert.False(result);
    }

    [Fact]
    public void IsUserValid_NullUser_ReturnsFalse()
    {
        bool result = UserHelper.IsUserValid(null);
        Assert.False(result);
    }
}