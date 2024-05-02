import pool from "../db.js";

class UserRepository {
  static async createUser({ userName, hashedPassword, role }) {
    const response = await pool.query(
      "INSERT INTO customer (first_name, hashed_password, user_type) VALUES ($1, $2, $3) RETURNING *",
      [userName, hashedPassword, role]
    );

    return response.rows[0];
  }

  static async getUserData(userName) {
    const response = await pool.query("SELECT * FROM customer WHERE first_name=$1", [
      userName,
    ]);

    if (!response.rows.length) {
      return null;
    }

    return response.rows[0];
  }
}

export default UserRepository;
