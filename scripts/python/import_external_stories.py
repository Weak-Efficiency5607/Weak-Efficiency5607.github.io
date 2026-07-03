import csv
import json
import os
import math

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.join(script_dir, '..', '..')
data_dir = os.path.join(root_dir, 'data')
csv_path = os.path.join(data_dir, 'external_lists', 'PSSD_Recovery_Database.csv')
json_path = os.path.join(data_dir, 'success-stories.json')

def import_csv():
    if not os.path.exists(csv_path):
        print(f"Error: Could not find CSV at {csv_path}")
        return

    # Load existing JSON
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                stories = json.load(f)
            except json.JSONDecodeError:
                stories = []
    else:
        stories = []

    # Map existing links to prevent duplicates
    existing_links = {story.get("link", "").strip(): story for story in stories if story.get("link")}
    
    new_additions = 0
    updated = 0

    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        # Read raw lines to skip metadata headers
        lines = f.readlines()
        
        start_idx = 0
        for i, line in enumerate(lines):
            if "EntryNo." in line and "Condition" in line:
                start_idx = i
                break
                
        if start_idx == 0 and "EntryNo." not in lines[0]:
            print("Could not find the header row.")
            return

        import io
        csv_data = io.StringIO("".join(lines[start_idx:]))
        reader = csv.DictReader(csv_data)

        for row in reader:
            link = row.get("Link", "").strip()
            if not link:
                continue
            
            title = row.get("Threat Title / Comment User", "Unknown User/Title").strip()
            if not title:
                title = "Unknown"

            # Build metadata dict with every field available
            meta = {}
            for k, v in row.items():
                if k and k not in ["Threat Title / Comment User", "Link", "EntryNo.", ""] and v:
                    val = str(v).strip()
                    if val and val.lower() != "nan" and val != "":
                        meta[k] = val

            # Specific mappings for standard filtering and rendering
            treatments = row.get("Treatments Used", "").strip()
            if treatments and treatments.lower() != "nan":
                meta["substances"] = [t.strip() for t in treatments.split(",") if t.strip()]

            condition = row.get("Condition", "").strip()
            if condition and condition.lower() != "nan":
                meta["cause"] = condition

            rec_type = row.get("Recovery Type", "").strip()
            if rec_type and rec_type.lower() != "nan":
                meta["type"] = rec_type

            rec_weeks = row.get("Recovery Weeks", "").strip()
            if rec_weeks and rec_weeks.lower() != "nan":
                meta["timeTaken"] = f"{rec_weeks} weeks"

            summary = row.get("Protocol Summary", "").strip()
            if summary and summary.lower() != "nan":
                meta["summary"] = summary
            
            # Create Card Structure
            card = {
                "icon": "🌐",
                "badgeClass": "badge",
                "badgeText": row.get("Condition", "External").strip() or "External",
                "title": title,
                "meta": meta,
                "link": link,
                "isExternal": True,
                "sourceName": "PSSD Recovery Database"
            }

            if link in existing_links:
                # Update existing entry
                existing = existing_links[link]
                existing.update(card)
                updated += 1
            else:
                stories.append(card)
                existing_links[link] = card
                new_additions += 1

    # Save back to JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(stories, f, indent=4, ensure_ascii=False)

    print(f"Successfully processed CSV. Added {new_additions} new stories, updated {updated} existing stories.")

if __name__ == "__main__":
    import_csv()
