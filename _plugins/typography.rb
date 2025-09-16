# _plugins/typography.rb
module Jekyll
  module TypographyFilter
    def french_typography(input)
      return input if input.nil?

      # remplace espace avant : ; ! ? par une espace insécable
      input.gsub(/ (\:|\«|\»|\;|\!|\?)/, " \\1")
    end
  end
end

Liquid::Template.register_filter(Jekyll::TypographyFilter)