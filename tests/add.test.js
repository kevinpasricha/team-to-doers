// TEST LOGIC HERE FOR FRONT END
const QUnit = require("qunit");
const request = require("supertest");
const app = require("../server");

QUnit.module("Todo API Tests", () => {
  QUnit.test("Valid Todo Add", async (assert) => {
    const loginres = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres.status,
      302,
      "Response status should be 302 for valid login to redirect to dashboard"
    );

    const todoData = {
      title: "Test Todo",
      description: "This is a test todo",
      dueDate: "2025-05-20",
    };

    const res = await request(app)
      .post("/todos")
      .send(todoData)
      .set("Accept", "application/json")
      .set("Cookie", loginres.headers["set-cookie"]);

    assert.equal(
      res.status,
      201,
      "Response status should be 201 for a successfuly todo creation"
    );
  });

  QUnit.test("Invalid Todo Add", async (assert) => {
    const loginres = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres.status,
      302,
      "Response status should be 302 for valid login to redirect to dashboard"
    );

    const todoData = {
      title: "", // Invalid date (missing field)
      description: "This is a test todo",
      dueDate: "2025-05-20",
    };

    const res = await request(app)
      .post("/todos")
      .send(todoData)
      .set("Accept", "application/json")
      .set("Cookie", loginres.headers["set-cookie"]);

    assert.equal(
      res.status,
      400,
      "Response status should be 400 for invalid data"
    );
  });
});
