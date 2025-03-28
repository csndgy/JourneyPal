using System;

namespace JourneyPalAdmin.Utils
{
    public static class InputValidator
    {
        public static bool IsStringValid(string input, bool allowNullOrEmpty = false, int minLength = 0, int maxLength = int.MaxValue)
        {
            if (string.IsNullOrEmpty(input))
                return allowNullOrEmpty;

            return input.Length >= minLength && input.Length <= maxLength;
        }

        public static bool IsEmailValid(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        public static bool IsPhoneNumberValid(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return false;

            // Basic check for digits and optional '+' at the start
            return System.Text.RegularExpressions.Regex.IsMatch(phoneNumber, @"^\+?[0-9\s\-\(\)]{7,}$");
        }

        public static bool IsPasswordValid(string password, int minLength = 8)
        {
            if (string.IsNullOrEmpty(password))
                return false;

            return password.Length >= minLength;
        }
    }
}