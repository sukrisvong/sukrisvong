module Core
  class HomeController < ApplicationController
    def index
      render json: { engine: "core", status: "ok" }
    end
  end
end
