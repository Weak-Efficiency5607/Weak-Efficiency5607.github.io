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
    "icon": "💊",
    "badgeClass": "badge badge-cured",
    "badgeText": "Recovered",
    "title": "Successful test of Pramipexole and Fluvoxamine",
    "meta": {
        "substances": [
            "Pramipexole",
            "Fluvoxamine"
        ],
        "type": "Treatment",
        "effectiveness": "100%",
        "timeTaken": "3 weeks",
        "cause": "Anhedonia",
        "duration": "Unknown",
        "summary": "The user successfully removed their anhedonia and increased their libido using Pramipexole (titrated up to 1.5mg). After enduring 3 weeks of terrible initial side effects (needed to overcome presynaptic autoreceptors), the medication worked perfectly with no side effects. However, for long-term safety and to avoid potential dopamine receptor downregulation or DAWS, the user chose to stop. They also found long-term success treating their symptoms safely using the SSRI Fluvoxamine (75-125mg), which they suspect helps via Sigma-1 receptor interactions with dopamine systems."
    },
    "link": "https://www.reddit.com/r/MAOIs/comments/x9q04h/comment/inuc0bt/"
}

stories.append(new_story)

new_json = json.dumps(stories, indent=4)
new_content = content[:json_match.start(1)] + new_json + content[json_match.end(1):]

with open('js/success-stories.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Added new story!")
