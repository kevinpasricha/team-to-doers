const supertest = require("supertest");
const QUnit = require("qunit");
const { app } = require("../server"); // Assuming the express app is exported from the server.js

QUnit.module("Register Endpoint Tests", (hooks) => {
  // Test for successful registration
  QUnit.test("should register a user successfully", async (assert) => {
    const response = await supertest(app).post("/register").send({
      username: "newUser",
      email: "newuser@example.com",
      password: "strongpassword123",
    });

    assert.equal(
      response.status,
      201,
      "Should return a 201 status code for successful registration"
    );
    assert.equal(
      response.text,
      "User registered successfully",
      "Response should confirm successful registration"
    );
  });

  // Test for missing fields
  QUnit.test("should return 400 for missing fields", async (assert) => {
    const response = await supertest(app).post("/register").send({
      username: "", // Missing username
      email: "newuser@example.com",
      password: "strongpassword123",
    });

    assert.equal(
      response.status,
      400,
      "Should return a 400 status code for missing fields"
    );
    assert.equal(
      response.text,
      "All fields are required",
      "Should prompt that all fields are required"
    );
  });

  // Test for invalid email format
  QUnit.test("should return 400 for invalid email", async (assert) => {
    const response = await supertest(app).post("/register").send({
      username: "newUser",
      email: "invalid-email", // Invalid email format
      password: "strongpassword123",
    });

    assert.equal(
      response.status,
      400,
      "Should return a 400 status code for invalid email format"
    );
    assert.equal(
      response.text,
      "Invalid email format",
      "Should indicate invalid email format"
    );
  });

  // Test for weak password
  QUnit.test("should return 400 for weak password", async (assert) => {
    const response = await supertest(app).post("/register").send({
      username: "newUser",
      email: "newuser@example.com",
      password: "weak", // Weak password
    });

    assert.equal(
      response.status,
      400,
      "Should return a 400 status code for weak password"
    );
    assert.equal(
      response.text,
      "Password must be at least 8 characters long",
      "Should indicate weak password"
    );
  });

  QUnit.test("should return 400 for username already taken", async (assert) => {
    // Assuming "existingUser" already exists in the database
    const response = await supertest(app).post("/register").send({
      username: "jsmith", // Existing username
      email: "newuser@example.com",
      password: "strongpassword123",
    });

    assert.equal(
      response.status,
      400,
      "Should return a 400 status code for already taken username"
    );
    assert.equal(
      response.text,
      "Username already taken",
      "Should indicate the username is already taken"
    );
  });

  // Test for already registered email
  QUnit.test(
    "should return 400 for email already registered",
    async (assert) => {
      const response = await supertest(app).post("/register").send({
        username: "newUser",
        email: "mpelter@test.com", // Existing email
        password: "strongpassword123",
      });

      assert.equal(
        response.status,
        400,
        "Should return a 400 status code for already registered email"
      );
      assert.equal(
        response.text,
        "Email already registered",
        "Should indicate the email is already registered"
      );
    }
  );
});

QUnit.load();
