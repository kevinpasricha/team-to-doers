const QUnit = require("qunit");
const request = require("supertest");
const app = require("../server");

QUnit.module("Todo Delete API Tests", () => {
  QUnit.test("Valid Todo Delete", async (assert) => {
    const loginres = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres.status,
      302,
      "Response status should be 302 for valid login to redirect to dashboard"
    );

    // Create a new todo to delete
    const todoData = {
      title: "Test Todo",
      description: "This is a test todo",
      dueDate: "2025-05-20",
    };

    const addres = await request(app)
      .post("/todos")
      .send(todoData)
      .set("Accept", "application/json")
      .set("Cookie", loginres.headers["set-cookie"]);

    assert.equal(
      addres.status,
      201,
      "Response status should be 201 for successful todo creation"
    );

    const todoId = addres.body.id; // Get the newly created todo's ID

    // Delete the todo
    const deleteres = await request(app)
      .delete(`/todos/${todoId}`)
      .set("Accept", "application/json")
      .set("Cookie", loginres.headers["set-cookie"]);

    assert.equal(
      deleteres.status,
      200,
      "Response status should be 200 for successful todo deletion"
    );
  });

  QUnit.test("Invalid Todo Delete (Non-existent ID)", async (assert) => {
    const loginres = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres.status,
      302,
      "Response status should be 302 for valid login to redirect to dashboard"
    );

    // Attempt to delete a non-existent todo
    const deleteres = await request(app)
      .delete("/todos/999999") // Non-existent ID
      .set("Accept", "application/json")
      .set("Cookie", loginres.headers["set-cookie"]);

    assert.equal(
      deleteres.status,
      404,
      "Response status should be 404 for deleting a non-existent todo"
    );
  });

  QUnit.test("Unauthorized Todo Delete", async (assert) => {
    // Login as test123
    const loginres1 = await request(app)
      .post("/login")
      .send({ username: "test123", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres1.status,
      302,
      "Response status should be 302 for valid login of user1"
    );

    // Create a new todo under user1
    const todoData = {
      title: "User1's Todo",
      description: "Belongs to user1",
      dueDate: "2025-05-20",
    };

    const addres = await request(app)
      .post("/todos")
      .send(todoData)
      .set("Accept", "application/json")
      .set("Cookie", loginres1.headers["set-cookie"]);

    assert.equal(
      addres.status,
      201,
      "Response status should be 201 for successful todo creation by user1"
    );

    const todoId = addres.body.id;

    // Login as matthewpelter (a different user)
    const loginres2 = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres2.status,
      302,
      "Response status should be 302 for valid login of user2"
    );

    // Attempt to delete user1's todo
    const deleteres = await request(app)
      .delete(`/todos/${todoId}`)
      .set("Accept", "application/json")
      .set("Cookie", loginres2.headers["set-cookie"]);

    assert.equal(
      deleteres.status,
      404,
      "Response status should be 404 because user2 cannot delete user1's todo"
    );
  });

  QUnit.test("Delete Todo Without Login", async (assert) => {
    // Attempt to delete a todo without authentication
    const deleteres = await request(app)
      .delete("/todos/1") // Assuming an existing todo ID
      .set("Accept", "application/json");

    assert.equal(
      deleteres.status,
      403,
      "Response status should be 403 for deleting a todo without authentication"
    );
  });
});
