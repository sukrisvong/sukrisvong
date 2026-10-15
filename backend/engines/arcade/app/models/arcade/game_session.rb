module Arcade
  class GameSession < ApplicationRecord
    self.table_name = "arcade_game_sessions"

    validates :session_id, presence: true, uniqueness: true
    validates :seed, presence: true
    validates :game, presence: true, inclusion: { in: %w[lane_dodger] }
    validates :expires_at, presence: true

    scope :valid, -> { where(used_at: nil).where("expires_at > ?", Time.current) }

    def expired?
      expires_at <= Time.current
    end

    def used?
      used_at.present?
    end

    def consume!
      update!(used_at: Time.current)
    end
  end
end
