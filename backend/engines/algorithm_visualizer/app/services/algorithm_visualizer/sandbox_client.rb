module AlgorithmVisualizer
  module SandboxClient
    HOST = ENV.fetch("SANDBOX_HOST", "sandbox")
    PORT = ENV.fetch("SANDBOX_PORT", "3001").to_i
    CONNECT_TIMEOUT = 5

    def self.call(code:, input:)
      socket = Socket.tcp(HOST, PORT, connect_timeout: CONNECT_TIMEOUT)
      socket.puts({ code: code, input: input }.to_json)
      response = socket.gets
      socket.close
      JSON.parse(response)
    rescue Errno::ECONNREFUSED, Errno::ETIMEDOUT, SocketError => e
      { "error" => "Sandbox unavailable: #{e.message}" }
    end
  end
end
