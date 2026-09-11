class CreateArcadeScores < ActiveRecord::Migration[8.1]
  def change
    create_table :arcade_scores do |t|
      t.string  :session_id, null: false, index: { unique: true }
      t.string  :player_name, null: false
      t.integer :score, null: false, default: 0
      t.string  :game, null: false
      t.string  :theme, null: false

      t.timestamps
    end

    add_index :arcade_scores, [ :game, :score ]
  end
end
