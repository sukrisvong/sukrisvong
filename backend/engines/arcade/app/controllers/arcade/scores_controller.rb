module Arcade
  class ScoresController < ApplicationController
    VALID_THEMES = %w[cyberpunk medieval].freeze

    def create
      session = GameSession.find_by(session_id: params[:session_id])
      return render json: { error: "Invalid session" }, status: :unprocessable_content if session.nil?
      return render json: { error: "Session already used" }, status: :unprocessable_content if session.used?
      return render json: { error: "Session expired" }, status: :unprocessable_content if session.expired?

      claimed = params[:claimed_score].to_i
      theme   = params[:theme]
      name    = params[:player_name].to_s.strip

      return render json: { error: "Invalid theme" }, status: :unprocessable_content unless VALID_THEMES.include?(theme)
      return render json: { error: "Player name required" }, status: :unprocessable_content if name.blank?
      return render json: { error: "Player name too long" }, status: :unprocessable_content if name.length > 30

      server_score = simulate(session, params[:inputs])
      unless (server_score - claimed).abs <= LaneDodger::Simulator::TOLERANCE
        return render json: { error: "Score could not be verified" }, status: :unprocessable_content
      end

      session.consume!
      score = Score.create!(
        session_id:  session.session_id,
        player_name: name,
        score:       server_score,
        game:        session.game,
        theme:       theme
      )

      render json: {
        id:          score.id,
        score:       score.score,
        rank:        score.rank,
        player_name: score.player_name
      }, status: :created
    end

    private

    def simulate(session, inputs)
      case session.game
      when "lane_dodger"
        LaneDodger::Simulator.run(seed: session.seed, inputs: Array(inputs))
      else
        0
      end
    end
  end
end
