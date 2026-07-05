import json
import os
import re
import PyPDF2

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.join(script_dir, '..', '..')
data_dir = os.path.join(root_dir, 'data')
pdf_path = os.path.join(data_dir, 'external_lists', 'pssd_recovery_compilation_expanded.md.pdf')
json_path = os.path.join(data_dir, 'success-stories.json')

def extract_text_from_pdf():
    text = ""
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
            
    # Clean up PDF extraction artifacts
    text = text.replace("Sour ce:", "Source:")
    text = text.replace("of f", "off")
    text = text.replace("T ime", "Time")
    text = text.replace("TR T", "TRT")
    text = text.replace("\ufb01", "fi")
    text = text.replace("\ufb02", "fl")
    text = text.replace("www .", "www.")
    text = text.replace(".or g", ".org")
    text = text.replace(".netlify .app", ".netlify.app")
    
    # Also clean up any key with a space before the colon incorrectly, like "Sour ce:"
    # We already did "Sour ce:", but let's do a generic one if needed. The above is fine for known ones.
    
    return text

def parse_cases(text):
    cases = []
    current_case = None
    current_field = None
    skip_case = False

    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if "TREATMENT PATTERNS ANALYSIS" in line or "Most Commonly Reported" in line or "Tier 1: Multiple" in line:
            break
            
        # Match Case Header
        # Example: Case 1: User "PSSD" (2015)
        # Or: Case 32-73: TRT/Hormone Recovery Compilation
        case_match = re.match(r'^Case\s+(\d+)(?:-\d+)?:\s+(.*)', line)
        if case_match:
            case_num = int(case_match.group(1))
            case_title = case_match.group(2)
            
            # Save previous case
            if current_case and not skip_case:
                cases.append(current_case)
                
            # Check if we should skip
            # The PDF says "Case 32-73:" but the table goes up to 68, and next is Case 69.
            # We want to skip the "Case 32-73" block itself, but NOT Case 69.
            # However, if a real case 32 to 68 appears, we skip it.
            # We will skip if case_num is between 32 and 68 (since 69 is valid).
            # The block is numbered 32 (from "32-73").
            if 32 <= case_num <= 68:
                skip_case = True
                current_case = None
                continue
                
            skip_case = False
            current_case = {
                "title": case_title,
                "meta": {},
                "source_link": None
            }
            current_field = None
            continue
            
        if skip_case or not current_case:
            continue
            
        # Match Field Header
        # Example: Source: https://...
        field_match = re.match(r'^([A-Za-z0-9 /-]+):\s*(.*)', line)
        if field_match:
            field_name = field_match.group(1).strip()
            field_value = field_match.group(2).strip()
            
            # Prevent "http" or "https" from being treated as a field
            if field_name.lower() in ["http", "https"]:
                if current_field:
                    current_case["meta"][current_field] += " " + line
                continue
            
            # Some lines are like "1. Inositol Recoveries" which is not a field.
            if re.match(r'^\d+$', field_name):
                # Probably a list item, not a field
                if current_field:
                    current_case["meta"][current_field] += " " + line
                continue
            
            current_field = field_name
            
            current_case["meta"][current_field] = field_value
        else:
            # Continuation of previous field
            if current_field:
                current_case["meta"][current_field] += " " + line

    # Add the last case
    if current_case and not skip_case:
        cases.append(current_case)
        
    # Post-process to extract source_link from Source field
    for case in cases:
        source_val = case["meta"].get("Source", "")
        if "http" in source_val:
            match = re.search(r'(https?://[^\s]+)', source_val)
            if match:
                case["source_link"] = match.group(1)
        
    return cases

def extract_substances(meta):
    substances = []
    # Try to guess substances from the Treatment fields
    treatment_text = ""
    for k, v in meta.items():
        if 'treatment' in k.lower() or 'medication' in k.lower():
            treatment_text += v + " "
    
    treatment_text = treatment_text.lower()
    
    # Simple keyword matching based on known treatments
    if 'inositol' in treatment_text: substances.append('Inositol')
    if 'st. john\'s wort' in treatment_text or 'sjw' in treatment_text: substances.append("St. John's Wort")
    if 'wellbutrin' in treatment_text or 'bupropion' in treatment_text: substances.append("Wellbutrin")
    if 'mianserin' in treatment_text: substances.append("Mianserin")
    if 'cabergoline' in treatment_text: substances.append("Cabergoline")
    if 'psilocybin' in treatment_text or 'mushrooms' in treatment_text: substances.append("Psilocybin")
    if 'mdma' in treatment_text: substances.append("MDMA")
    if 'bpc-157' in treatment_text: substances.append("BPC-157")
    if 'ibogaine' in treatment_text: substances.append("Ibogaine")
    if 'lithium' in treatment_text: substances.append("Lithium")
    if 'pelvic floor' in treatment_text: substances.append("Pelvic Floor Therapy")
    if 'fecal' in treatment_text or 'fmt' in treatment_text: substances.append("FMT (Microbiome)")
    if 'flagyl' in treatment_text or 'sibo' in treatment_text or 'antibiotics' in treatment_text: substances.append("Antibiotics/SIBO Protocol")
    if 'natural' in treatment_text or 'time' in treatment_text: substances.append("Natural Recovery")
    
    if not substances:
        substances.append("Various/Unknown")
        
    # Deduplicate
    return list(set(substances))

def format_for_json(cases):
    formatted = []
    for case in cases:
        meta = case["meta"]
        
        # Build summary if possible
        summary = meta.get("Final Outcome", meta.get("Outcome", "Recovery reported."))
        if len(summary) > 200:
            summary = summary[:197] + "..."
            
        cause = meta.get("Causative Medication", "Antidepressants")
        duration = meta.get("Recovery Duration", "Unknown")
        
        # Base structured fields
        structured_meta = {
            "substances": extract_substances(meta),
            "type": "Cure" if "100%" in str(meta).upper() or "CURE" in str(meta).upper() else "Improvement",
            "cause": cause,
            "duration": duration,
            "summary": summary
        }
        
        # Merge all original dynamic fields as requested
        for k, v in meta.items():
            structured_meta[k] = v
            
        formatted.append({
            "icon": "📝",
            "badgeClass": "badge badge-success",
            "badgeText": "Documented",
            "title": case["title"],
            "sourceName": "PSSD Recovery Database",
            "link": case["source_link"] or "",
            "meta": structured_meta
        })
    return formatted

def update_json(new_stories):
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                stories = json.load(f)
            except Exception:
                stories = []
    else:
        stories = []
        
    existing_links = {s.get("link", ""): s for s in stories if s.get("link")}
    
    added = 0
    for story in new_stories:
        link = story.get("link", "")
        # Prevent duplicates based on link or title
        if link and link in existing_links:
            continue
            
        # Check by title if no link
        if any(s.get("title") == story["title"] for s in stories):
            continue
            
        stories.append(story)
        added += 1
        
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(stories, f, indent=4, ensure_ascii=False)
        
    print(f"Added {added} new stories.")

if __name__ == "__main__":
    print("Extracting text from PDF...")
    text = extract_text_from_pdf()
    print("Parsing cases...")
    cases = parse_cases(text)
    print(f"Extracted {len(cases)} valid cases.")
    formatted = format_for_json(cases)
    print("Updating JSON...")
    update_json(formatted)
    print("Done!")
