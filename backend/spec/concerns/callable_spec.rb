require "rails_helper"

RSpec.describe Callable do
  let(:callable_class) do
    Class.new do
      include Callable

      def call
        :result
      end
    end
  end

  describe ".call" do
    it "instantiates the class and calls #call" do
      expect(callable_class.call).to eq(:result)
    end
  end
end
