import json
import os
import base64
import re
import sys

def generate_typst_report(json_file_path, output_dir="typst_report"):
    """
    Génère un rapport Typst à partir d'un fichier JSON de projet.
    Extrait les images base64 et les enregistre dans le répertoire de sortie.
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            project_data = json.load(f)
    except FileNotFoundError:
        print(f"Erreur : Fichier JSON introuvable à {json_file_path}")
        return
    except json.JSONDecodeError:
        print(f"Erreur : Impossible de décoder le JSON depuis {json_file_path}")
        return

    # Créer le répertoire de sortie s'il n'existe pas
    os.makedirs(output_dir, exist_ok=True)
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)

    typst_content = []

    # Détails du projet
    typst_content.append(f"= Rapport d'Inspection : {project_data['location']}\n")
    typst_content.append(f"Caractéristiques du bâtiment : {project_data['buildingCharacteristics'] or 'Non spécifié.'}\n")
    typst_content.append("\n#h(1em)\n") # Petit espace vertical

    # Niveaux
    if not project_data['levels']:
        typst_content.append("Aucun niveau enregistré pour ce projet.\n")
    else:
        for level in project_data['levels']:
            typst_content.append(f"== Niveau : {level['name']}\n")
            typst_content.append("\n#h(1em)\n")

            # Espaces
            if not level['spaces']:
                typst_content.append("Aucun espace enregistré pour ce niveau.\n")
            else:
                for space in level['spaces']:
                    typst_content.append(f"=== Espace : {space['name']}\n")
                    typst_content.append("\n#h(1em)\n")

                    # Observations
                    has_observations = False
                    
                    # Define standard locations and their French names
                    standard_locations_order = ["floor", "wall", "ceiling"]
                    location_display_names = {
                        "floor": "Sol",
                        "wall": "Mur",
                        "ceiling": "Plafond"
                    }
                    
                    # Keep track of all unique locations found in this space's observations
                    all_space_locations = set(space['observations'].keys())
                    
                    # Process standard locations first, in a defined order
                    for location_key in standard_locations_order:
                        observations = space['observations'].get(location_key, []) # Safely get observations, default to empty list
                        if observations:
                            has_observations = True
                            location_name = location_display_names.get(location_key, location_key.capitalize())
                            typst_content.append(f"==== Observations du {location_name}\n")
                            typst_content.append("#list[\n")
                            for obs in observations:
                                typst_content.append(f"  * {obs['text']}\n")
                                if obs['photos']:
                                    typst_content.append("    #h(0.5em)\n")
                                    for i, photo_base64 in enumerate(obs['photos']):
                                        try:
                                            match = re.match(r"data:image/(\w+);base64,(.*)", photo_base64)
                                            if match:
                                                ext = match.group(1)
                                                encoded = match.group(2)
                                                if ext == 'jpeg': ext = 'jpg'
                                                
                                                image_data = base64.b64decode(encoded)
                                                
                                                image_filename = f"obs_{obs['id']}_{i}.{ext}"
                                                image_path = os.path.join(images_dir, image_filename)
                                                
                                                with open(image_path, 'wb') as img_file:
                                                    img_file.write(image_data)
                                                
                                                typst_content.append(f"    #image(\"images/{image_filename}\", width: 50%)\n")
                                                typst_content.append("    #h(0.5em)\n")
                                            else:
                                                typst_content.append(f"    // Format d'image base64 non reconnu pour l'observation {obs['id']}.\n")
                                        except Exception as e:
                                            typst_content.append(f"    // Erreur lors de l'extraction de l'image pour l'observation {obs['id']}: {e}\n")
                                            typst_content.append(f"    // Données Base64 (pour débogage): {photo_base64[:50]}...\n")
                            typst_content.append("]\n")
                            typst_content.append("\n#h(1em)\n")
                        
                    # Process any custom locations that are not standard
                    for location_key in sorted(all_space_locations - set(standard_locations_order)):
                        observations = space['observations'].get(location_key, [])
                        if observations:
                            has_observations = True
                            location_name = location_key.capitalize() # Custom location, just capitalize
                            typst_content.append(f"==== Observations de {location_name}\n")
                            typst_content.append("#list[\n")
                            for obs in observations:
                                typst_content.append(f"  * {obs['text']}\n")
                                if obs['photos']:
                                    typst_content.append("    #h(0.5em)\n")
                                    for i, photo_base64 in enumerate(obs['photos']):
                                        try:
                                            match = re.match(r"data:image/(\w+);base64,(.*)", photo_base64)
                                            if match:
                                                ext = match.group(1)
                                                encoded = match.group(2)
                                                if ext == 'jpeg': ext = 'jpg'
                                                
                                                image_data = base64.b64decode(encoded)
                                                
                                                image_filename = f"obs_{obs['id']}_{i}.{ext}"
                                                image_path = os.path.join(images_dir, image_filename)
                                                
                                                with open(image_path, 'wb') as img_file:
                                                    img_file.write(image_data)
                                                
                                                typst_content.append(f"    #image(\"images/{image_filename}\", width: 50%)\n")
                                                typst_content.append("    #h(0.5em)\n")
                                            else:
                                                typst_content.append(f"    // Format d'image base64 non reconnu pour l'observation {obs['id']}.\n")
                                        except Exception as e:
                                            typst_content.append(f"    // Erreur lors de l'extraction de l'image pour l'observation {obs['id']}: {e}\n")
                                            typst_content.append(f"    // Données Base64 (pour débogage): {photo_base64[:50]}...\n")
                                typst_content.append("]\n")
                                typst_content.append("\n#h(1em)\n")
                                
                    if not has_observations:
                        typst_content.append("Aucune observation enregistrée pour cet espace.\n")
                    typst_content.append("\n#pagebreak()\n") # Saut de page après chaque espace pour une meilleure lisibilité

    # Écrire le contenu Typst dans un fichier
    output_typst_file = os.path.join(output_dir, "report.typ")
    with open(output_typst_file, 'w', encoding='utf-8') as f:
        f.write("".join(typst_content))

    print(f"Rapport Typst généré avec succès à {output_typst_file}")
    print(f"Images enregistrées dans {images_dir}")

if __name__ == "__main__":
    # Chemin du fichier JSON hardcodé pour le débogage
    hardcoded_json_file_path = 'projet_0a900d8a-657c-4571-be3b-ba366ce51141.json'
    
    if len(sys.argv) > 1:
        # Si un argument est fourni, utilisez-le (comportement normal)
        json_file_path = sys.argv[1]
        print(f"Utilisation du chemin fourni en argument : {json_file_path}")
        generate_typst_report(json_file_path)
    else:
        # Sinon, utilisez le chemin hardcodé
        print(f"Aucun argument fourni. Utilisation du chemin hardcodé : {hardcoded_json_file_path}")
        generate_typst_report(hardcoded_json_file_path)