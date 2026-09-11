module Arcade
  module LaneDodger
    # Linear congruential generator — identical algorithm used in the TypeScript client.
    # Parameters from Numerical Recipes: m=2^32, a=1664525, c=1013904223.
    class Rng
      A = 1664525
      C = 1013904223
      M = 2**32

      def initialize(seed)
        @x = seed.to_i & 0xFFFFFFFF
      end

      def next_int(max)
        @x = (A * @x + C) % M
        @x % max
      end
    end
  end
end
