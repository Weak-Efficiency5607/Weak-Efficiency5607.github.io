import json

with open('data/success-stories.json', 'r', encoding='utf-8') as f:
    stories = json.load(f)

new_story = {
    "icon": "⏳",
    "badgeClass": "badge",
    "badgeText": "Significant Improvement",
    "title": "Gradual natural reawakening of visualization and emotion",
    "meta": {
        "substances": [
            "Time (Natural Recovery)"
        ],
        "type": "Partial Recovery",
        "effectiveness": "100% visualization restored, 35% emotions restored",
        "timeTaken": "16-22 months",
        "cause": "Prozac (2 pills)",
        "duration": "22 months (ongoing)",
        "summary": "After taking just two pills of Prozac, the user suffered a complete loss of their visualization abilities (aphantasia) and severe emotional anesthesia (including the complete inability to feel fear or adrenaline). By month 16, their visualization abilities fully naturally restored to 100%. Between months 19 and 22, the physical sensations of emotions—such as adrenaline, goosebumps, and the 'oh shit' feeling of surprise—began to randomly reawaken in their head, restoring about 30-35% of their emotional capacity and bringing back the ability to feel atmosphere in music and movies."
    },
    "link": "https://www.reddit.com/r/PSSD/comments/yi0pnu/the_partial_return_of_adrenaline/"
}

stories.append(new_story)

with open('data/success-stories.json', 'w', encoding='utf-8') as f:
    json.dump(stories, f, indent=4)
    
print("Added new story!")
