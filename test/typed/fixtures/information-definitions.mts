// Serialized definitions captured from the legacy commands before migration.
export const informationDefinitions = [
    {
        "options": [],
        "name": "randomcat",
        "description": "Get a picture of a random cat!",
        "type": 1
    },
    {
        "options": [],
        "name": "randomdog",
        "description": "Get a picture of a random dog!",
        "type": 1
    },
    {
        "options": [
            {
                "type": 3,
                "name": "location",
                "description": "Choose the location where you want weather forecast from!",
                "required": true
            },
            {
                "type": 3,
                "choices": [
                    {
                        "name": "Metric (Celsius)",
                        "value": "metric"
                    },
                    {
                        "name": "Imperial (Fahrenheit)",
                        "value": "imperial"
                    },
                    {
                        "name": "Kelvin",
                        "value": "kelvin"
                    }
                ],
                "name": "units",
                "description": "Your tools use one of the following: rock, paper, scissors",
                "required": true
            }
        ],
        "name": "weather",
        "description": "Get the current weather forecast for a location",
        "type": 1
    }
];
