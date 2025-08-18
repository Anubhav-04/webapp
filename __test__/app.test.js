const request = require("supertest");
const app = require("../app");

describe("Web App Tests", () => {
  it("should return Hello message on /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Hello from my simple web app");
  });

  it("should return todos JSON", async () => {
    const res = await request(app).get("/todos");
    expect(res.statusCode).toBe(200);
    expect(res.body[0].task).toBe("Deploy to Vercel");
  });
});
