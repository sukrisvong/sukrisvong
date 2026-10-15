class CreateArcadeGameSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :arcade_game_sessions do |t|
      t.string  :session_id, null: false, index: { unique: true }
      t.bigint  :seed, null: false
      t.string  :game, null: false
      t.datetime :expires_at, null: false
      t.datetime :used_at

      t.timestamps
    end

    add_index :arcade_game_sessions, [ :game, :expires_at ]
  end
end
