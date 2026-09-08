// Optional binding retained for the starter's database helper.
// This exhibit does not provision or use a database.
declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
  }
}
