import json

with open('data/success-stories.json', 'r', encoding='utf-8') as f:
    stories = json.load(f)

new_story = {
    "icon": "⏳",
    "badgeClass": "badge",
    "badgeText": "Recovered (80%)",
    "title": "My (Long) Recovery Story - Full Fall and Rise",
    "meta": {
        "substances": [
            "Time (Natural Recovery)",
            "Cialis Daily (Tadalafil)"
        ],
        "type": "Partial Recovery",
        "effectiveness": "80% (Considered perfect by user)",
        "timeTaken": "4-5 years",
        "cause": "Sertraline (SSRI)",
        "duration": "4+ years",
        "summary": "The user developed severe PSSD and emotional blunting from 6 months of Sertraline. After 4 years of obsessing over a cure, they completely gave up. Letting go of the obsession became their turning point. Natural improvements slowly followed. They met a supportive partner, experienced natural arousal, and used Cialis Daily to overcome their ED. They are now 80% recovered and consider this new baseline perfect."
    },
    "link": "https://www.reddit.com/r/PSSD/comments/1algw6w/my_long_recovery_story_full_fall_and_rise/"
}

stories.append(new_story)

with open('data/success-stories.json', 'w', encoding='utf-8') as f:
    json.dump(stories, f, indent=4)
    
print("Added new story!")
