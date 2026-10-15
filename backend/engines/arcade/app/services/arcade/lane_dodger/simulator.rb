module Arcade
  module LaneDodger
    # Deterministic game simulator — mirrors the TypeScript client exactly.
    # Given a seed (obstacle spawning) and an input log (player moves), returns
    # the score the player achieved.  The score endpoint compares this against
    # the client's claimed score; a difference > TOLERANCE rejects the submission.
    class Simulator
      LANES             = 3
      PLAYER_LANE_START = 1
      LIVES             = 3
      INVINCIBILITY_MS  = 800
      TRAVEL_DISTANCE   = 530   # px from spawn point to player row
      BASE_SPEED        = 200   # px/s at tier 0
      SPEED_PER_TIER    = 30    # px/s added per tier
      BASE_INTERVAL     = 2000  # ms between spawns at tier 0
      INTERVAL_DROP     = 150   # ms removed per tier
      MIN_INTERVAL      = 500   # ms floor
      MS_PER_TIER       = 8_000 # ms of survival to advance one tier
      MAX_MS            = 300_000
      SCORE_DIVISOR     = 100   # score = elapsed_ms / SCORE_DIVISOR
      TOLERANCE         = 5     # allowed score delta

      def self.run(seed:, inputs:, max_ms: MAX_MS)
        new(seed: seed, inputs: inputs, max_ms: max_ms).run
      end

      def initialize(seed:, inputs:, max_ms: MAX_MS)
        @rng       = Rng.new(seed)
        @inputs    = Array(inputs).sort_by { |i| i["t"].to_i }
        @max_ms    = max_ms
      end

      def run
        lane_timeline = build_lane_timeline
        lives         = LIVES
        invincible_until = -1
        death_ms = nil

        spawn_ms      = obstacle_interval(tier_at(0))
        while spawn_ms <= @max_ms
          obs_lane     = @rng.next_int(LANES)
          travel_ms    = (TRAVEL_DISTANCE * 1000.0 / obstacle_speed(tier_at(spawn_ms))).round
          hit_ms       = spawn_ms + travel_ms

          if hit_ms <= @max_ms
            player_lane = lane_at(lane_timeline, hit_ms)
            if player_lane == obs_lane && hit_ms > invincible_until
              lives -= 1
              if lives <= 0
                death_ms = hit_ms
                break
              end
              invincible_until = hit_ms + INVINCIBILITY_MS
            end
          end

          spawn_ms += obstacle_interval(tier_at(spawn_ms))
        end

        (death_ms || @max_ms) / SCORE_DIVISOR
      end

      private

      def build_lane_timeline
        lane = PLAYER_LANE_START
        @inputs.map do |input|
          dir  = input["dir"]
          delta = dir == "right" ? 1 : -1
          lane  = (lane + delta).clamp(0, LANES - 1)
          { t: input["t"].to_i, lane: lane }
        end
      end

      def lane_at(timeline, t)
        timeline.select { |e| e[:t] <= t }.last&.dig(:lane) || PLAYER_LANE_START
      end

      def tier_at(ms)
        [ (ms / MS_PER_TIER).floor, 9 ].min
      end

      def obstacle_speed(tier)
        BASE_SPEED + tier * SPEED_PER_TIER
      end

      def obstacle_interval(tier)
        [ BASE_INTERVAL - tier * INTERVAL_DROP, MIN_INTERVAL ].max
      end
    end
  end
end
