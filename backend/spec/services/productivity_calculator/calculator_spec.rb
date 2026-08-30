require "rails_helper"

RSpec.describe ProductivityCalculator::Calculator do
  def calculate(start_time: "09:00", hours: 6, minutes: 0, goal: 85)
    described_class.new(
      start_time: start_time,
      hours_scheduled: hours,
      minutes_scheduled: minutes,
      productivity_goal: goal
    ).call
  end

  describe "#call" do
    context "with valid input" do
      subject(:calc) { calculate }

      it { is_expected.to be_success }
      it { expect(calc.errors).to be_empty }

      it "calculates total time on site" do
        expect(calc.result.time_required).to eq("7 hours and 3 minutes")
      end

      it "calculates end time" do
        expect(calc.result.end_time).to eq("04:03 PM")
      end
    end

    context "when evenly divisible" do
      it "formats duration without minutes" do
        expect(calculate(hours: 8, minutes: 0, goal: 100).result.time_required).to eq("8 hours")
      end
    end

    context "with scheduled minutes" do
      it "accounts for them in duration" do
        expect(calculate(hours: 5, minutes: 30, goal: 100).result.time_required).to eq("5 hours and 30 minutes")
      end
    end

    context "at 100% productivity" do
      it "returns time on site equal to scheduled time" do
        expect(calculate(hours: 6, minutes: 0, goal: 100).result.time_required).to eq("6 hours")
      end
    end

    context "comparing productivity levels" do
      it "lower productivity means more time on site" do
        high = calculate(hours: 6, minutes: 0, goal: 90).result.time_required
        low  = calculate(hours: 6, minutes: 0, goal: 70).result.time_required
        expect(parse_minutes(low)).to be > parse_minutes(high)
      end
    end
  end

  describe "validation" do
    it "returns error for blank start time" do
      calc = calculate(start_time: "")
      expect(calc).not_to be_success
      expect(calc.errors).to include("Invalid start time")
    end

    it "returns error for invalid start time" do
      calc = calculate(start_time: "not-a-time")
      expect(calc).not_to be_success
      expect(calc.errors).to include("Invalid start time")
    end

    it "returns error when productivity goal is zero" do
      calc = calculate(goal: 0)
      expect(calc).not_to be_success
      expect(calc.errors).to include("Productivity goal must be greater than 0")
    end

    it "returns error when productivity goal is negative" do
      calc = calculate(goal: -10)
      expect(calc).not_to be_success
      expect(calc.errors).to include("Productivity goal must be greater than 0")
    end

    it "accumulates multiple errors" do
      calc = calculate(start_time: "bad", goal: 0)
      expect(calc.errors.length).to eq(2)
    end

    it "returns nil result on failure" do
      calc = calculate(start_time: "bad")
      expect(calc.result).to be_nil
    end
  end

  private

  def parse_minutes(duration)
    h = duration.match(/(\d+) hours?/)&.captures&.first.to_i
    m = duration.match(/(\d+) minutes?/)&.captures&.first.to_i
    (h * 60) + m
  end
end
