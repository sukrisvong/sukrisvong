require "rails_helper"

RSpec.describe AlgorithmVisualizer::SandboxClient do
  let(:response_json) { { "final" => [ 1, 2, 3 ] }.to_json }
  let(:fake_socket) do
    instance_double(Socket, puts: nil, gets: response_json + "\n", close: nil)
  end

  before do
    allow(Socket).to receive(:tcp).and_return(fake_socket)
  end

  describe ".call" do
    it "sends JSON to the sandbox and parses the response" do
      result = described_class.call(code: "def sort(arr); end", input: [ 3, 1, 2 ])
      expect(result).to eq("final" => [ 1, 2, 3 ])
      expect(fake_socket).to have_received(:puts).with(
        { code: "def sort(arr); end", input: [ 3, 1, 2 ] }.to_json
      )
    end

    context "when the sandbox is unavailable" do
      it "returns an error hash on connection refused" do
        allow(Socket).to receive(:tcp).and_raise(Errno::ECONNREFUSED)
        result = described_class.call(code: "def sort(arr); end", input: [ 3, 1, 2 ])
        expect(result["error"]).to match(/Sandbox unavailable/)
      end

      it "returns an error hash on timeout" do
        allow(Socket).to receive(:tcp).and_raise(Errno::ETIMEDOUT)
        result = described_class.call(code: "def sort(arr); end", input: [ 3, 1, 2 ])
        expect(result["error"]).to match(/Sandbox unavailable/)
      end
    end
  end
end
