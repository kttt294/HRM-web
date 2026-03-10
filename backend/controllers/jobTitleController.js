const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const jobTitleController = {
  async getAll(req, res, next) {
    try {
      const [rows] = await db.query("SELECT * FROM job_titles ORDER BY name ASC");
      res.json(toCamelCase(rows));
    } catch (error) {
      next(error);
    }
  }
};

module.exports = jobTitleController;
