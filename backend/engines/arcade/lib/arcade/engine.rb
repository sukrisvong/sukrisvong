module Arcade
  class Engine < ::Rails::Engine
    isolate_namespace Arcade

    initializer "arcade.migrations" do |app|
      config.paths["db/migrate"].expanded.each do |path|
        app.config.paths["db/migrate"] << path
      end
    end
  end
end
