import pg from "pg";

const pool = new pg.Pool({
  user: "senid517",
  password: "xyi1234",
  host: "77.221.143.210",
  port: 5433,
  database: "taxi",
});

export default pool;
