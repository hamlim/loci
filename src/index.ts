import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/update/:latitude/:longitude", async (c) => {
  if (c.req.query("key") !== c.env.KEY) {
    return c.text("Invalid key", 401);
  }

  const latitude = c.req.param("latitude");
  const longitude = c.req.param("longitude");

  if (
    !latitude ||
    !longitude ||
    Number.isNaN(Number.parseFloat(latitude)) ||
    Number.isNaN(Number.parseFloat(longitude))
  ) {
    return c.text("Invalid latitude or longitude", 400);
  }

  let db = c.env.DB;
  try {
    await db
      .prepare("INSERT INTO locations (latitude, longitude) VALUES (?, ?)")
      .bind(latitude, longitude)
      .run();
    return c.text("OK");
  } catch (e) {
    console.error(e);
    return c.text("Internal server error", 500);
  }
});

app.get("/locations", async (c) => {
  if (c.req.query("key") !== c.env.KEY) {
    return c.text("Invalid key", 401);
  }

  let db = c.env.DB;
  let locations = await db.prepare("SELECT * FROM locations").all();
  if (locations.error) {
    console.error(locations.error);
    return c.text("Internal server error", 500);
  }

  let locationsArray = locations.results.map((location) => ({
    latitude: location.latitude,
    longitude: location.longitude,
    createdAt: location.created_at,
  }));

  return c.json(locationsArray);
});

app.all("*", (c) => {
  return c.text("Not found", 404);
});

export default app;
