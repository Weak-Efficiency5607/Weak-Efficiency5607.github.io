import json
import re

with open('js/success-stories.js', 'r', encoding='utf-8') as f:
    content = f.read()

json_match = re.search(r'const stories = (\[.*?\]);', content, re.DOTALL)
if not json_match:
    print('JSON not found')
    exit(1)

stories = json.loads(json_match.group(1))

new_story = {
    "icon": "🌟",
    "badgeClass": "badge badge-cured",
    "badgeText": "Recovered",
    "title": "Fully Recovered from DP/DR",
    "meta": {
        "substances": [
            "Diet (No Gluten/Dairy/Sugar)",
            "Intense Exercise (Cardio/Weights)",
            "Zinc, Glycine, Omega-3, Vit D",
            "Sunlight, Cold Showers & Grounding"
        ],
        "type": "Cure",
        "effectiveness": "100%",
        "timeTaken": "Progressive (2-3 years)",
        "cause": "5-alpha reductase inhibitor (PFS)",
        "duration": "2-3+ years",
        "summary": "The user developed extreme DP/DR, brain fog, and emotional blunting after taking a 5-alpha reductase inhibitor for hair loss, which triggered a massive panic attack. They achieved full recovery over 2-3 years through a comprehensive lifestyle overhaul: fixing gut health (cutting gluten, dairy, sugar), engaging in high-intensity cardio and resistance training, utilizing targeted supplements (Zinc, Glycine, Omega-3s), and adopting grounding techniques like sunlight exposure and cold showers. They have now been fully recovered for over 5 years."
    },
    "link": "https://www.reddit.com/r/dpdr/comments/1kuslxi/fully_recovered_from_dpdr_that_was_so_severe_i/"
}

stories.append(new_story)

new_json = json.dumps(stories, indent=4)
new_content = content[:json_match.start(1)] + new_json + content[json_match.end(1):]

with open('js/success-stories.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Added new story!")
