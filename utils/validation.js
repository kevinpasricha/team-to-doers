const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

// Helper function for password strength validation
const isValidPassword = (password) => {
  return password.length >= 8;
};

module.exports = {
  isValidEmail,
  isValidPassword,
};
