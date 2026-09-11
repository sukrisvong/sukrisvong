# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_11_000002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "arcade_game_sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "game", null: false
    t.bigint "seed", null: false
    t.string "session_id", null: false
    t.datetime "updated_at", null: false
    t.datetime "used_at"
    t.index ["game", "expires_at"], name: "index_arcade_game_sessions_on_game_and_expires_at"
    t.index ["session_id"], name: "index_arcade_game_sessions_on_session_id", unique: true
  end

  create_table "arcade_scores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "game", null: false
    t.string "player_name", null: false
    t.integer "score", default: 0, null: false
    t.string "session_id", null: false
    t.string "theme", null: false
    t.datetime "updated_at", null: false
    t.index ["game", "score"], name: "index_arcade_scores_on_game_and_score"
    t.index ["session_id"], name: "index_arcade_scores_on_session_id", unique: true
  end
end
