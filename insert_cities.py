import json

# Load the JSON
with open('indian_states_cities.json', 'r') as file:
    data = json.load(file)

# Get state name from user
state_name = input("Enter state name: ").strip()

# Find the state in the JSON data
state_found = False
for state in data['states']:
    if state['name'].lower() == state_name.lower():
        state_found = True
        # Keep adding cities until user types 'ex'
        while True:
            city = input("Enter city name (type 'ex' to exit): ")
            if city.lower() == 'ex':
                break
            if city not in state['cities']:
                state['cities'].append(city)
                state['cities'].sort()  # Sort cities in ascending alphabetical order
                print(f"Added {city} to {state['name']}")
            else:
                print(f"{city} already exists in {state['name']}")

# If state not found
if not state_found:
    print(f"State {state_name} not found")

# Save the updated JSON back to the file
with open('indian_states_cities.json', 'w') as file:
    json.dump(data, file, indent=2)