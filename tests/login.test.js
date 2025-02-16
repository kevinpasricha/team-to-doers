// TEST LOGIC HERE FOR FRONT END
const QUnit = require("qunit");
const request = require("supertest");
const app = require("../server");

QUnit.module("Login API Tests", () => {
  QUnit.test("Valid login returns success", async (assert) => {
    const res = await request(app)
      .post("/login")
      .send({ username: "user1", password: "password123" })
      .set("Accept", "application/json");

    assert.equal(
      res.status,
      200,
      "Response status should be 200 for valid login"
    );
    // Additional assertions (such as checking redirection or session data) can be added here.
  });

  QUnit.test("Invalid login returns error", async (assert) => {
    const res = await request(app)
      .post("/login")
      .send({ username: "wrong", password: "wrong" })
      .set("Accept", "application/json");

    assert.equal(
      res.status,
      400,
      "Response status should be 400 for invalid credentials"
    );
  });

  QUnit.test("Dashboard access without login is forbidden", async (assert) => {
    const res = await request(app)
      .get("/dashboard")
      .set("Accept", "application/json");

    assert.equal(
      res.status,
      403,
      "Accessing dashboard without authentication should be forbidden"
    );
  });
});
