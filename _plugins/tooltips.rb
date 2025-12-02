# _plugins/tooltips.rb
module Jekyll
  module TooltipsFilter
    
    # Dictionnaire des tooltips
    TOOLTIPS = {
      "immersions holotropiques" => "En référence à la respiration holotropique qui est une pratique thérapeutique et de développement personnel qui utilise la puissance du souffle via une respiration contrôlée et de la musique pour explorer les profondeurs de la conscience.",
      "respiration holotropique" => "Pratique thérapeutique utilisant la respiration consciente et la musique pour explorer les profondeurs de la conscience.",
      "hypnose transpersonnelle" => "Une forme d'hypnose qui explore les dimensions spirituelles et symboliques de l'inconscient, au-delà de la simple résolution de symptômes.",
      "rituels symboliques" => "Des actes intentionnels et symboliques qui marquent un passage, une transformation, ou qui ancrent une intention profonde dans le corps et la psyché.",
      "actes psychomagiques" => "Gestes symboliques personnalisés qui agissent sur l'inconscient en créant un pont entre le monde intérieur et la réalité concrète.",
      "liminalité" => "État intermédiaire entre deux mondes : quand l'ancien n'est plus et le nouveau n'est pas encore. Un espace de transformation profonde.",
      "transpersonnel" => "Dimension de la psyché qui dépasse l'ego et le personnel pour toucher à l'universel, au spirituel, au collectif.",
      "psychose" => "Trouble psychiatrique sévère caractérisé par une perte de contact avec la réalité (hallucinations, délires). Nécessite un suivi médical spécialisé.",
      "troubles psychiatriques sévères" => "Pathologies mentales graves nécessitant un suivi médical (psychose, bipolarité non stabilisée, schizophrénie, etc.).",
      "dimension spirituelle" => "L'aspect sacré, transcendant ou existentiel d'une épreuve, au-delà de sa dimension psychologique ou émotionnelle.",
      "dimension sacrée" => "L'aspect spirituel, initiatique ou transcendant d'un processus de guérison, qui dépasse la simple résolution de symptômes.",
      "psychopraticien" => "Professionnel de l'accompagnement psychologique qui n'est ni médecin, ni psychologue, mais qui pratique des approches thérapeutiques alternatives ou complémentaires.",
      "psychopraticien transpersonnel" => "Professionnel qui intègre les dimensions spirituelle, symbolique et corporelle dans l'accompagnement psychologique.",
      "somatique" => "Qui concerne le corps, qui passe par le corps. Approches thérapeutiques qui travaillent avec les sensations et la mémoire corporelle.",
      "supervision" => "Accompagnement professionnel régulier du praticien par un pair expérimenté, garantissant la qualité et l'éthique de la pratique.",
    }

    def add_tooltips(input)
      return input if input.nil?
      
      output = input.dup
      
      # Trier les clés par longueur décroissante pour éviter les remplacements partiels
      sorted_keys = TOOLTIPS.keys.sort_by { |k| -k.length }
      
      sorted_keys.each do |text|
        tooltip_content = TOOLTIPS[text]
        
        # Pattern qui gère mieux les caractères accentués
        # Utilise des lookahead/lookbehind pour les limites de mots
        pattern = Regexp.new("(?<![a-zàâäéèêëïîôöùûüÿæœç])#{Regexp.escape(text)}(?![a-zàâäéèêëïîôöùûüÿæœç])", Regexp::IGNORECASE)
        
        # Remplacer uniquement si ce n'est pas déjà dans un tooltip ou une balise
        output = output.gsub(pattern) do |match|
          before_match = $`  # Texte avant le match
          after_match = $'   # Texte après le match
          
          # Vérifier qu'on n'est pas déjà dans une balise tooltip
          # On cherche le dernier < avant le match
          last_open_tag_pos = before_match.rindex('<')
          last_close_tag_pos = before_match.rindex('>')
          
          # Si le dernier < est après le dernier >, on est dans une balise
          in_tag = last_open_tag_pos && (!last_close_tag_pos || last_open_tag_pos > last_close_tag_pos)
          
          # Vérifier qu'on n'est pas déjà dans un tooltip
          # On cherche "tooltip-trigger" dans les 200 derniers caractères
          recent_context = before_match[-200..-1] || before_match
          in_tooltip = recent_context.include?('tooltip-trigger') && 
                       !recent_context.rindex('tooltip-trigger').nil? &&
                       (recent_context.rindex('</span>').nil? || 
                        recent_context.rindex('tooltip-trigger') > recent_context.rindex('</span>'))
          
          # Vérifier qu'on n'est pas dans un attribut HTML (href, class, etc.)
          in_attribute = false
          if last_open_tag_pos
            tag_content = before_match[last_open_tag_pos..-1]
            # Si on trouve un = sans guillemet fermant après, on est dans un attribut
            in_attribute = tag_content =~ /=["'][^"']*$/
          end
          
          # Si on est dans une balise, un tooltip existant, ou un attribut, ne pas remplacer
          if in_tag || in_tooltip || in_attribute
            match
          else
            '<span class="tooltip-trigger" tabindex="0" aria-expanded="false" role="button">' + 
            match + 
            '<span class="tooltip" role="tooltip">' + 
            tooltip_content + 
            '</span></span>'
          end
        end
      end
      
      output
    end
  end
end

Liquid::Template.register_filter(Jekyll::TooltipsFilter)