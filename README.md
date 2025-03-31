<<<<<<< HEAD
public Fin<Guid> ValidateAccessToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Secret"]!);

        var validationParameters = new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAudience =_config["Jwt:Audience"],
            ValidIssuer = _config["Jwt:Issuer"]!,
            ValidateIssuerSigningKey = true,
            ValidateAudience = true,
            ValidateIssuer = true,
            ClockSkew = TimeSpan.Zero,
        };

        var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

        if(validatedToken is not JwtSecurityToken jwtToken || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256Signature))
            return Error.New("Invalid token algorithm.");

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid userId)
            ? Error.New("User Id is missing or invalid in the token.")
            : userId;
    }
=======
# JourneyPal

## Bevezetés
A **JourneyPal** egy innovatív alkalmazás, amely segít a felhasználóknak utazásaik megtervezésében és szervezésében. Célja, hogy átlátható és felhasználóbarát módon kezelje az utazási információkat.

## Főbb Funkciók
- **Úticélok kezelése** – Hozzáadhatsz és szerkeszthetsz különböző úti célokat.
- **Jegyzet kezelés** - Adj hozzá, módosíts vagy törölj jegyzeteket az utazásaidon belül.
- **Teendőlista** – Az utazás előtt és alatt kezelheted a fontos teendőket *(COMING SOON)*.
- **Ajánlott látnivalók** - Alkalmazásunk a közösség által lélegzetelállítónak ítélt helyekből javasol neked párat utazásaihoz.

**És még rengeteg minden más vár titeket, ugyanis egy aktív és remek fejlesztő csapat áll az alkalmazás mögött, akik alig várják, hogy a közösség miként reagál majd a legújabb érkező funkciókra.**

## Telepítés
### Szükséges előfeltételek
- Windows / macOS / Linux operációs rendszer
- .NET 6+ telepítve
- Node.js és npm telepítve (React futtatásához)
- Internetkapcsolat a frissítésekhez
- **Harmadik féltől származó szoftverek:**
  - [Papercut SMTP](https://github.com/ChangemakerStudios/Papercut-SMTP) – az e-mailek helyi teszteléséhez

### Telepítési lépések
1. **Backend telepítése és futtatása:**
   ```sh
   git clone https://github.com/csndgy/JourneyPal.git
   cd JourneyPal
   dotnet run
   ```

2. **React frontend telepítése és futtatása:**
   ```sh
   cd JourneyPal/JourneyPal
   npm install
   npm run dev
   ```
   ⚠ __Amennyiben a React localhost környezet NEM az *5173-as* porton nyílik meg, a szervert be kell zárni a terminálban *(CTRL+C -> Y)* és újra kell futtani ameddig nem a megfelelő porton nyílik meg.__ ⚠

3. **Papercut SMTP szerver letöltése és futtatása:**
    
   * Navigáljunk el a [Papercut SMTP](https://github.com/ChangemakerStudios/Papercut-SMTP/releases) **Releases** oldalra.
   * Találjuk meg a legfrissebb verziót.
   * A letöltési listából keressük ki a következőt:
        * PapercutSMTP-win-x64-stable-Portable.zip
   * Letöltés után csomagoljuk ki a zip fájl tartalmát egy tetszőleges mappába.
   * Futtassuk a **"Papercut SMTP.exe"** nevű fájlt.

## Használat
- Indítsd el az alkalmazást a `dotnet run` paranccsal.
- Válassz egy úti célt, és adj hozzá további információkat.
- Használd az útvonaltervezőt a legjobb utazási opciók megtekintéséhez.
- Kezeld költségeidet és teendőidet az alkalmazáson belül.
- A React frontend a `http://localhost:3000` címen érhető el.

## Fejlesztőknek
Ha szeretnél hozzájárulni a fejlesztéshez:
```sh
git clone https://github.com/csndgy/JourneyPal.git
cd JourneyPal
dotnet build
```
A React frontend fejlesztéséhez:
```sh
cd JourneyPal/JourneyPal
npm run dev
```



## FAQ

#### Hol van a forráskód?

A forráskód [ebben](https://github.com/csndgy/JourneyPal/) a GitHub repo-ban található meg.

#### Hogyan indítható be a termék/kell-e előkészíteni bármit is?

Ezekről a részletes utasítások megtalálhatóak itt, a GitHub oldalunkon a **Telepítés** főkategóriában, illetve a **"A JourneyPal dokumentációja.docx** állományban.


## Unit test
#### Áttekintés
Ez a dokumentum a JourneyPalAdmin alkalmazás InputValidator és UserHelper segédosztályainak unit tesztjeit írja le. A tesztek ellenőrzik, hogy a bemenet validáló és felhasználó összehasonlító logika megfelelően működik különböző feltételek mellett.

### Teszt Kategóriák

**InputValidator tesztek**

 - Az `InputValidator` statikus osztály tesztei, amely sztringek, email címek, telefonszámok és jelszavak validálását végzi. 

#### `IsStringValid` tesztek
```csharp
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
```
- **Cél:** A sztring bemenet validálása a null/üres engedélyezés, valamint minimális és maximális hossz alapján.
- **Tesztesetek:**
     - Null vagy üres sztringek `false` értéket adnak vissza, kivéve ha explicit engedélyezett.
     - A megfelelő hosszúságú sztringek `true` értéket adnak vissza.
     - A `minLength`-nél rövidebb vagy `maxLength`-nél hosszabb sztringek `false` értéket adnak vissza.

#### `IsEmailValid` tesztek
```csharp
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
```
- **Cél:** Email cím formátum ellenőrzése a `.NET MailAddress` osztályával.
- **Tesztesetek:**
     - Helyes formátumú email címek (pl. `test@example.com`) `true` értéket adnak vissza.
     - Helytelen formátumú email címek (pl. `invalid-email`) `false` értéket adnak vissza.

#### `IsPhoneNumberValid` tesztek
```csharp
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
```
- **Cél:** Telefonszám formátum ellenőrzése regex segítségével.
- **Tesztesetek:**
     - Helyes formátumú telefonszámok (pl. `+1234567890`) `true` értéket adnak vissza.
     - Helytelen formátumú telefonszámok (pl. `abc123`) `false` értéket adnak vissza.

#### `IsPasswordValid` tesztek
```csharp
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
```
- **Cél:** Jelszó hosszának ellenőrzése.
- **Tesztesetek:**
     - A `minLength` követelménynek megfelelő jelszavak `true` értéket adnak vissza.
     - A `minLength`-nél rövidebb jelszavak `false` értéket adnak vissza.

#

**UserHelper tesztek**
 - Az `UserHelper` statikus osztály tesztei, amely felhasználó validálást és összehasonlítást végez.

#### `IsUserValid` tesztek
```csharp
[Theory]
[InlineData("validUser", "test@example.com", "+1234567890", true)]
[InlineData("", "test@example.com", "+1234567890", false)] // Üres felhasználónév
[InlineData("validUser", "invalid-email", "+1234567890", false)] // Helytelen email
[InlineData("validUser", "test@example.com", "abc123", false)] // Helytelen telefonszám
public void IsUserValid_ShouldValidateCorrectly(string username, string email, string phone, bool expected)
{
    var user = new User { UserName = username, Email = email, PhoneNumber = phone };
    bool result = UserHelper.IsUserValid(user);
    Assert.Equal(expected, result);
}

[Fact]
public void IsUserValid_NullUser_ReturnsFalse()
{
    bool result = UserHelper.IsUserValid(null);
    Assert.False(result);
}
```
- **Cél:** Egy `User` objektum validálása a `UserName`, `Email` és `PhoneNumber` tulajdonságok alapján.
- **Tesztesetek:**
     - Érvényes felhasználók (minden mező helyes) `true` értéket adnak vissza.
     - Érvénytelen felhasználók (bármely mező helytelen) `false` értéket adnak vissza.
     - Null felhasználók `false` értéket adnak vissza.

#### `AreUsersEqual` tesztek
```csharp
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
```
- **Cél:** Két `User` objektum összehasonlítása a tulajdonságaik alapján.
- **Tesztesetek:**
     - Azonos tulajdonságokkal rendelkező felhasználók `true` értéket adnak vissza.
     - Különböző tulajdonságokkal rendelkező felhasználók `false` értéket adnak vissza.

### Összefoglalás
Ezek a unit tesztek lefedik az InputValidator és UserHelper osztályok alapvető funkcionalitását, biztosítva a megbízható validálást és összehasonlítást. A tesztek tartalmaznak szélsőséges eseteket is (pl. null bemenet, helytelen formátumok), hogy a valós felhasználási esetekben is megbízhatóan működjenek.
## Licenc

MIT License

Copyright (c) 2025 JourneyPal Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
>>>>>>> 9f342c7f98dc23797662f8fb0d1e68003eb514ab
