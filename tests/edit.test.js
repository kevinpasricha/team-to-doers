const QUnit = require("qunit");
const request = require("supertest");
const app = require("../server");

QUnit.module("Todo Edit API Tests", () => {
  QUnit.test("Valid Todo Edit", async (assert) => {
    const loginres = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres.status,
      302,
      "Response status should be 302 for valid login to redirect to dashboard"
    );

    // Create a new todo to edit
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

    // Update the todo
    const updatedTodo = {
      title: "Updated Todo",
      description: "This todo has been updated",
      dueDate: "2025-06-15",
    };

    const editres = await request(app)
      .put(`/todos/${todoId}`)
      .send(updatedTodo)
      .set("Accept", "application/json")
      .set("Cookie", loginres.headers["set-cookie"]);

    assert.equal(
      editres.status,
      200,
      "Response status should be 200 for successful todo update"
    );

    assert.equal(
      editres.body.title,
      updatedTodo.title,
      "Updated title should match the sent data"
    );

    assert.equal(
      editres.body.description,
      updatedTodo.description,
      "Updated description should match the sent data"
    );
  });

  QUnit.test("Invalid Todo Edit", async (assert) => {
    const loginres = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres.status,
      302,
      "Response status should be 302 for valid login to redirect to dashboard"
    );

    // Create a new todo to edit
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

    const todoId = addres.body.id;

    // Attempt to edit with missing fields
    const invalidUpdate = {
      title: "", // Invalid: empty title
      description: "Updated description",
      dueDate: "2025-06-15",
    };

    const editres = await request(app)
      .put(`/todos/${todoId}`)
      .send(invalidUpdate)
      .set("Accept", "application/json")
      .set("Cookie", loginres.headers["set-cookie"]);

    assert.equal(
      editres.status,
      400,
      "Response status should be 400 for missing required fields"
    );
  });

  QUnit.test("Edit Unauthorized Todo", async (assert) => {
    // Login as user1
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

    // Login as user2 (a different user)
    const loginres2 = await request(app)
      .post("/login")
      .send({ username: "matthewpelter", password: "password" })
      .set("Accept", "application/json");

    assert.equal(
      loginres2.status,
      302,
      "Response status should be 302 for valid login of user2"
    );

    // Attempt to edit user1's todo
    const unauthorizedUpdate = {
      title: "User2 Updated Todo",
      description: "Trying to edit someone else's todo",
      dueDate: "2025-06-15",
    };

    const editres = await request(app)
      .put(`/todos/${todoId}`)
      .send(unauthorizedUpdate)
      .set("Accept", "application/json")
      .set("Cookie", loginres2.headers["set-cookie"]);

    assert.equal(
      editres.status,
      404,
      "Response status should be 404 because user2 cannot edit user1's todo"
    );
  });

  QUnit.test("Edit Todo Without Login", async (assert) => {
    // Attempt to edit a todo without authentication
    const unauthorizedEdit = {
      title: "Should Not Work",
      description: "Trying to edit without login",
      dueDate: "2025-06-15",
    };

    const editres = await request(app)
      .put("/todos/1") // Assuming an existing todo ID
      .send(unauthorizedEdit)
      .set("Accept", "application/json");

    assert.equal(
      editres.status,
      403,
      "Response status should be 403 for editing a todo without authentication"
    );
  });
});
