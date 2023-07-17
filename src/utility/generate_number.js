export function generateRandomNumbers() {
    var numbers = [];
    
    for (var i = 0; i < 6; i++) {
      var randomNumber = Math.floor(Math.random() * 10);
      numbers.push(randomNumber);
    }

    var combinedNumber = numbers.join('');
    var result = parseInt(combinedNumber);
    
    return result;
  }

export function generatePassword() {
    var length = 8; // Độ dài của chuỗi
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"; // Tập ký tự được cho phép
  
    var password = "";
    var hasNumber = false;
    var hasCapital = false;
    var hasLowercase = false;
    var hasSpecial = false;
  
    while (password.length < length || !hasNumber || !hasCapital || !hasLowercase || !hasSpecial) {
      var randomChar = charset[Math.floor(Math.random() * charset.length)];
      password += randomChar;
  
      // Kiểm tra các yêu cầu
      if (/[0-9]/.test(randomChar)) {
        hasNumber = true;
      } else if (/[A-Z]/.test(randomChar)) {
        hasCapital = true;
      } else if (/[a-z]/.test(randomChar)) {
        hasLowercase = true;
      } else if (/[!@#$%^&*()_+]/.test(randomChar)) {
        hasSpecial = true;
      }
    }
  
    return password;
  }