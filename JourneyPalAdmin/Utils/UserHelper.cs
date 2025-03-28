using JourneyPalAdmin.Models;

namespace JourneyPalAdmin.Utils
{
    public static class UserHelper
    {
        public static bool IsUserValid(User user)
        {
            if (user == null)
                return false;

            return InputValidator.IsStringValid(user.UserName) &&
                   InputValidator.IsEmailValid(user.Email) &&
                   InputValidator.IsPhoneNumberValid(user.PhoneNumber);
        }

        public static bool AreUsersEqual(User user1, User user2)
        {
            if (user1 == null || user2 == null)
                return false;

            return user1.UserName == user2.UserName &&
                   user1.Email == user2.Email &&
                   user1.PhoneNumber == user2.PhoneNumber;
        }
    }
}