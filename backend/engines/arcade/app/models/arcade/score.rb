module Arcade
  class Score < ApplicationRecord
    self.table_name = "arcade_scores"

    belongs_to :game_session, class_name: "Arcade::GameSession", foreign_key: "session_id",
               primary_key: "session_id", optional: true

    validates :player_name, presence: true, length: { maximum: 30 }
    validates :score, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
    validates :game, presence: true, inclusion: { in: %w[lane_dodger] }
    validates :theme, presence: true

    scope :for_game, ->(game) { where(game: game) }
    scope :top, ->(n) { order(score: :desc).limit(n) }

    def rank
      self.class.for_game(game).where("score > ?", score).count + 1
    end
  end
end
