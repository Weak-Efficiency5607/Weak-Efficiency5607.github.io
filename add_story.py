import json

with open('data/success-stories.json', 'r', encoding='utf-8') as f:
    stories = json.load(f)

new_story = {
    "icon": "📝",
    "badgeClass": "badge badge-cured",
    "badgeText": "Recovered",
    "title": "CBT, Pleasure Predicting, and Gratitude",
    "meta": {
        "substances": [
            "CBT",
            "Pleasure Predicting Sheet",
            "Gratitude/Self-Esteem Journal",
            "Behavioral Activation (Day Planning)"
        ],
        "type": "Cure",
        "effectiveness": "100%",
        "timeTaken": "Progressive (1 week for final breakthrough)",
        "cause": "Depression",
        "duration": "5 years",
        "summary": "The user suffered from depression and anhedonia for 5 years. While traditional CBT helped lift their depression, their anhedonia lingered. They eventually achieved a full breakthrough by strictly utilizing positivity-focused tools: a Pleasure Predicting Sheet (visualizing and anticipating fun), a gratitude/self-esteem journal, and hour-by-hour day scheduling. Within a week of this strict regimen, they relearned how to have fun. Five years later, they returned to confirm they have remained completely free of anhedonia ever since."
    },
    "link": "https://www.reddit.com/r/CBT/comments/catlyl/anyway_to_treat_anhedonia/"
}

stories.append(new_story)

with open('data/success-stories.json', 'w', encoding='utf-8') as f:
    json.dump(stories, f, indent=4)
    
print("Added new story!")
