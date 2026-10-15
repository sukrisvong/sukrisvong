module Arcade
  class LeaderboardController < ApplicationController
    VALID_GAMES = %w[lane_dodger].freeze
    PAGE_SIZE   = 10

    def index
      game = params[:game] || "lane_dodger"
      return render json: { error: "Unknown game" }, status: :unprocessable_content unless VALID_GAMES.include?(game)

      scores = Score.for_game(game).top(PAGE_SIZE)

      render json: scores.map.with_index(1) { |s, rank|
        { rank: rank, player_name: s.player_name, score: s.score, theme: s.theme, created_at: s.created_at.iso8601 }
      }
    end
  end
end
