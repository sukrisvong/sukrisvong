module Arcade
  class SessionsController < ApplicationController
    VALID_GAMES    = %w[lane_dodger].freeze
    SESSION_TTL    = 5.minutes
    SEED_MAX       = 2**32

    def create
      game = params[:game]
      return render json: { error: "Unknown game" }, status: :unprocessable_content unless VALID_GAMES.include?(game)

      session = GameSession.create!(
        session_id: SecureRandom.uuid,
        seed:       SecureRandom.random_number(SEED_MAX),
        game:       game,
        expires_at: SESSION_TTL.from_now
      )

      render json: {
        session_id: session.session_id,
        seed:       session.seed,
        game:       session.game,
        expires_at: session.expires_at.iso8601
      }, status: :created
    end
  end
end
